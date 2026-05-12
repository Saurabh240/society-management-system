package com.gstech.saas.platform.user.service;

import static com.gstech.saas.platform.audit.model.AuditEvent.LOGIN;

import com.gstech.saas.platform.user.dto.*;
import com.gstech.saas.platform.user.model.*;
import com.gstech.saas.platform.user.repository.PasswordResetTokenRepository;
import com.gstech.saas.platform.user.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    private final UserRepository repo;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder encoder;
    private final AuditService auditService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final MailService mailService;

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
        user.setName(req.name());
        user.setPassword(encoder.encode(req.password()));
        user.setRole(Role.TENANT_ADMIN); // default role
        user.setStatus(UserStatus.ACTIVE); // default status
        user.setTenantId(tenantId); // IMPORTANT

        User saved = repo.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole(),
                saved.getStatus()
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

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new ResponseStatusException(
                    HttpStatusCode.valueOf(403),
                    "User is inactive"
            );
        }

        //To check the temp password
        if (Boolean.TRUE.equals(user.getTemporaryPassword())) {

            if (user.getTempPasswordExpiry() != null &&
                    user.getTempPasswordExpiry().isBefore(Instant.now())) {

                throw new ResponseStatusException(
                        HttpStatusCode.valueOf(403),
                        "Temporary password expired. Please reset your password."
                );
            }
        }

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
                stored.getTenantId(),
                user.getEmail(),
                user.getRole().name(),
                user.getId());

        issueRefreshTokenCookie(userId, stored.getTenantId(), response);

        String newRefreshToken = issueRefreshTokenCookie(userId, stored.getTenantId(), response);

        return new RefreshResponse(newAccessToken);
    }

    @Transactional
    public void logout(Authentication authentication) {
        AuthUser authUser = (AuthUser) authentication.getPrincipal();
        refreshTokenRepository.revokeAllByUserId(authUser.userId());
    }

    public List<UserResponse> listUsers() {

        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new RuntimeException("Tenant not resolved");
        }

        return repo.findAllByTenantId(tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse updateStatus(Long id, UpdateStatusRequest req) {

        Long tenantId = TenantContext.get();

        User user = repo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(req.status());
        repo.save(user);

        return toResponse(user);
    }

    public void deleteUser(Long id) {

        Long tenantId = TenantContext.get();

        User user = repo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        repo.delete(user);
    }

    @Transactional
    public UserResponse invite(InviteUserRequest req) {

        Long tenantId = TenantContext.get();

        if (tenantId == null) {
            throw new RuntimeException("Tenant not resolved");
        }

        if (repo.existsByEmailAndTenantId(req.email(), tenantId)) {
            throw new RuntimeException("User already exists");
        }

        // Generate temporary password
        String tempPassword = generateTempPassword();

        User user = new User();
        user.setName(req.name());
        user.setEmail(req.email());
        user.setPassword(encoder.encode(tempPassword));
        user.setRole(req.role());
        user.setTenantId(tenantId);
        user.setStatus(UserStatus.ACTIVE);

        // Recommended fields
        user.setTemporaryPassword(true);
        user.setTempPasswordExpiry(
                Instant.now().plus(24, ChronoUnit.HOURS)
        );

        User saved = repo.save(user);

        // invalidate old tokens
        passwordResetTokenRepository.markAllUsedByUserId(saved.getId());

        // create reset token
        String rawToken = UUID.randomUUID().toString();

        String tokenHash = sha256Hex(rawToken);

        PasswordResetToken resetToken = new PasswordResetToken();

        resetToken.setUserId(saved.getId());
        resetToken.setTenantId(tenantId);
        resetToken.setTokenHash(tokenHash);
        resetToken.setExpiresAt(
                Instant.now().plus(24, ChronoUnit.HOURS)
        );
        resetToken.setUsed(false);

        passwordResetTokenRepository.save(resetToken);

        String resetLink =
                frontendBaseUrl + "/reset-password?token=" + rawToken;

        // Send email with temp password
        mailService.sendInviteEmail(
                saved.getEmail(),
                saved.getName(),
                tempPassword,
                resetLink
        );

        return toResponse(saved);
    }


    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        // 1️⃣ Hash incoming token
        String hash = sha256Hex(request.token());

        // 2️⃣ Find token
        PasswordResetToken token = passwordResetTokenRepository
                .findByTokenHashAndUsedFalse(hash)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        // 3️⃣ Check expiry
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Token expired");
        }

        // 4️⃣ Load user
        User user = repo.findById(token.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 5️⃣ Update password
        user.setPassword(encoder.encode(request.newPassword()));
        user.setStatus(UserStatus.ACTIVE);

        user.setTemporaryPassword(false);
        user.setTempPasswordExpiry(null);
        repo.save(user);

        // 6️⃣ Mark token used
        token.setUsed(true);
        passwordResetTokenRepository.save(token);
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

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }

    private String generateTempPassword() {

        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        StringBuilder password = new StringBuilder();

        SecureRandom random = new SecureRandom();

        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }
}
