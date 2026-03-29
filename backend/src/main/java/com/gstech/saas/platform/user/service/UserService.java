package com.gstech.saas.platform.user.service;

import static com.gstech.saas.platform.audit.model.AuditEvent.LOGIN;
import static org.apache.commons.codec.digest.DigestUtils.sha256Hex;

import com.gstech.saas.platform.user.model.*;
import com.gstech.saas.platform.user.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.security.JwtTokenProvider;
import com.gstech.saas.platform.security.Role;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import com.gstech.saas.platform.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder encoder;
    private final AuditService auditService;
    private final RefreshTokenRepository refreshTokenRepository;

    // ================= REGISTER =================
    public UserResponse register(RegisterRequest req) {

        Long tenantId = TenantContext.get();

        if (tenantId == null) {
            throw new RuntimeException("Tenant not resolved");
        }

        if (repo.existsByEmailAndTenantId(req.email(), tenantId)) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setEmail(req.email());
        user.setPassword(encoder.encode(req.password()));
        user.setRole(Role.TENANT_ADMIN); // default role
        user.setTenantId(tenantId); // IMPORTANT

        User saved = repo.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getRole() // return as String
        );
    }

    // ================= LOGIN =================
    @Transactional
    public LoginResponse login(LoginRequest req, HttpServletResponse response) {

        Long tenantId = TenantContext.get();
        if (tenantId == null) throw new RuntimeException("Tenant not resolved");

        User user = repo.findByEmailAndTenantId(req.email(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatusCode.valueOf(404), "User not found"));

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String accessToken = jwtTokenProvider.generateToken(
                tenantId, user.getEmail(), user.getRole().name(), user.getId());

        // Issue refresh token cookie
        auditService.log(LOGIN.name(), "User", user.getId(), user.getId());

        refreshTokenRepository.revokeAllByUserId(user.getId());
        issueRefreshTokenCookie(user.getId(), tenantId, response); // ← no need to capture return value

        return new LoginResponse(accessToken, user.getRole().name());
    }
    @Transactional
    public RefreshResponse refresh(String refreshToken, HttpServletResponse response) {

        Claims claims;
        try {
            claims = jwtTokenProvider.parseRefreshToken(refreshToken);
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        Long userId = Long.valueOf(claims.getSubject());
        String hash = sha256Hex(refreshToken);

        RefreshToken stored = refreshTokenRepository
                .findByTokenHashAndRevokedFalse(hash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token revoked or not found"));

        // Rotate: revoke old token
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = repo.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String newAccessToken = jwtTokenProvider.generateToken(
                stored.getTenantId(),    // tenantId stored at login time
                user.getEmail(),
                user.getRole().name(),
                user.getId());

        // Issue new refresh token cookie
        issueRefreshTokenCookie(userId, stored.getTenantId(), response);

        String newRefreshToken = issueRefreshTokenCookie(userId, stored.getTenantId(), response);

        return new RefreshResponse(newAccessToken, newRefreshToken);
    }
    private String issueRefreshTokenCookie(Long userId, Long tenantId, HttpServletResponse response) {

        UUID tokenId = UUID.randomUUID();
        String refreshJwt = jwtTokenProvider.generateRefreshToken(userId, tokenId);

        RefreshToken rt = new RefreshToken();
        rt.setUserId(userId);
        rt.setTenantId(tenantId);
        rt.setTokenHash(sha256Hex(refreshJwt));
        rt.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshTokenRepository.save(rt);

        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshJwt)
                .httpOnly(true)
                .secure(false)               // ← set true in production (HTTPS)
                .sameSite("Strict")
                .path("/users/refresh")      // ← cookie sent only to this path
                .maxAge(Duration.ofDays(7))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return refreshJwt;
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
