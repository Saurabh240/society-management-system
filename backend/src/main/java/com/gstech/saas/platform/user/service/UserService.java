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

    private final UserRepository                repo;
    private final JwtTokenProvider              jwtTokenProvider;
    private final PasswordEncoder               encoder;
    private final AuditService                  auditService;
    private final RefreshTokenRepository        refreshTokenRepository;
    private final PasswordResetTokenRepository  passwordResetTokenRepository;
    private final MailService                   mailService;

    // ── REGISTER ──────────────────────────────────────────────────────────────

    public UserResponse register(RegisterRequest req) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) throw new RuntimeException("Tenant not resolved");

        if (repo.existsByEmailAndTenantId(req.email(), tenantId))
            throw new RuntimeException("User already exists");

        User user = new User();
        user.setEmail(req.email());
        user.setName(req.name());
        user.setPassword(encoder.encode(req.password()));
        user.setRole(req.role() != null ? req.role() : Role.TENANT_ADMIN);
        user.setStatus(UserStatus.ACTIVE);
        user.setTenantId(tenantId);

        User saved = repo.save(user);
        return toResponse(saved);
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────

    @Transactional
    public LoginResponse login(LoginRequest req, HttpServletResponse response) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) throw new RuntimeException("Tenant not resolved");

        User user = repo.findByEmailAndTenantId(req.email(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatusCode.valueOf(404), "User not found"));

        if (user.getStatus() == UserStatus.INACTIVE)
            throw new ResponseStatusException(HttpStatusCode.valueOf(403), "User is inactive");

        if (Boolean.TRUE.equals(user.getTemporaryPassword())) {
            if (user.getTempPasswordExpiry() != null && user.getTempPasswordExpiry().isBefore(Instant.now()))
                throw new ResponseStatusException(HttpStatusCode.valueOf(403), "Temporary password expired. Please reset your password.");
        }

        if (!encoder.matches(req.password(), user.getPassword()))
            throw new BadCredentialsException("Invalid credentials");

        String accessToken = jwtTokenProvider.generateToken(tenantId, user.getEmail(), user.getRole().name(), user.getId());
        auditService.log(LOGIN.name(), "User", user.getId(), user.getId());
        refreshTokenRepository.revokeAllByUserId(user.getId());
        issueRefreshTokenCookie(user.getId(), tenantId, response);

        return new LoginResponse(accessToken, user.getRole().name());
    }

    // ── REFRESH ───────────────────────────────────────────────────────────────

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

        RefreshToken stored = refreshTokenRepository.findByTokenHashAndRevokedFalse(hash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token revoked or not found"));

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = repo.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String newAccessToken = jwtTokenProvider.generateToken(
                stored.getTenantId(), user.getEmail(), user.getRole().name(), user.getId());

        issueRefreshTokenCookie(userId, stored.getTenantId(), response);
        return new RefreshResponse(newAccessToken);
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────────

    @Transactional
    public void logout(Authentication authentication) {
        AuthUser authUser = (AuthUser) authentication.getPrincipal();
        refreshTokenRepository.revokeAllByUserId(authUser.userId());
    }

    // ── LIST USERS ────────────────────────────────────────────────────────────

    public List<UserResponse> listUsers() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) throw new RuntimeException("Tenant not resolved");
        return repo.findAllByTenantId(tenantId).stream().map(this::toResponse).toList();
    }

    // ── UPDATE STATUS ─────────────────────────────────────────────────────────

    public UserResponse updateStatus(Long id, UpdateStatusRequest req) {
        Long tenantId = TenantContext.get();
        User user = repo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(req.status());
        return toResponse(repo.save(user));
    }

    // ── UPDATE ROLE ───────────────────────────────────────────────────────────

    /**
     * Changes a user's role within the same tenant.
     * A user cannot change their own role — the calling user's ID is
     * extracted from TenantContext (we compare against the JWT subject).
     *
     * TENANT_ADMIN cannot be demoted by themselves.
     * PLATFORM_ADMIN is not accessible through this endpoint (different path).
     */
    public UserResponse updateRole(Long id, UpdateRoleRequest req) {
        Long tenantId = TenantContext.get();

        User user = repo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

        // Guard: do not allow assigning PLATFORM_ADMIN through this endpoint
        if (req.role() == Role.PLATFORM_ADMIN) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Cannot assign PLATFORM_ADMIN role");
        }

        user.setRole(req.role());
        return toResponse(repo.save(user));
    }

    // ── DELETE USER ───────────────────────────────────────────────────────────

    public void deleteUser(Long id) {
        Long tenantId = TenantContext.get();
        User user = repo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        repo.delete(user);
    }

    // ── INVITE ────────────────────────────────────────────────────────────────

    @Transactional
    public UserResponse invite(InviteUserRequest req) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) throw new RuntimeException("Tenant not resolved");

        if (repo.existsByEmailAndTenantId(req.email(), tenantId))
            throw new RuntimeException("User already exists");

        String tempPassword = generateTempPassword();

        User user = new User();
        user.setName(req.name());
        user.setEmail(req.email());
        user.setPassword(encoder.encode(tempPassword));
        user.setRole(req.role());
        user.setTenantId(tenantId);
        user.setStatus(UserStatus.ACTIVE);
        user.setTemporaryPassword(true);
        user.setTempPasswordExpiry(Instant.now().plus(24, ChronoUnit.HOURS));

        User saved = repo.save(user);

        passwordResetTokenRepository.markAllUsedByUserId(saved.getId());

        String rawToken = UUID.randomUUID().toString();
        String tokenHash = sha256Hex(rawToken);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(saved.getId());
        resetToken.setTenantId(tenantId);
        resetToken.setTokenHash(tokenHash);
        resetToken.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);

        String resetLink = frontendBaseUrl + "/reset-password?token=" + rawToken;
        mailService.sendInviteEmail(saved.getEmail(), saved.getName(), tempPassword, resetLink);

        return toResponse(saved);
    }

    // ── RESET PASSWORD ────────────────────────────────────────────────────────

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String hash = sha256Hex(request.token());
        PasswordResetToken token = passwordResetTokenRepository
                .findByTokenHashAndUsedFalse(hash)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (token.getExpiresAt().isBefore(Instant.now()))
            throw new RuntimeException("Token expired");

        User user = repo.findById(token.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(encoder.encode(request.newPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setTemporaryPassword(false);
        user.setTempPasswordExpiry(null);
        repo.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    // ── ROLES ─────────────────────────────────────────────────────────────────

    public List<RoleResponse> getRoles() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) throw new RuntimeException("Tenant not resolved");
        return List.of(
                buildRoleResponse(Role.TENANT_ADMIN, "Full Access",  tenantId),
                buildRoleResponse(Role.MANAGER,      "Read / Write", tenantId),
                buildRoleResponse(Role.VIEWER,        "Read Only",   tenantId)
        );
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

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
                .secure(false)
                .sameSite("Strict")
                .path("/users/refresh")
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
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getStatus());
    }

    private RoleResponse buildRoleResponse(Role role, String label, Long tenantId) {
        long count = repo.countByRoleAndTenantId(role, tenantId);
        return new RoleResponse(role.name(), label, count);
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < 8; i++) password.append(chars.charAt(random.nextInt(chars.length())));
        return password.toString();
    }
}