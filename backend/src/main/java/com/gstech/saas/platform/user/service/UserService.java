package com.gstech.saas.platform.user.service;

import static com.gstech.saas.platform.audit.model.AuditEvent.LOGIN;

import com.gstech.saas.platform.tenant.model.Tenant;
import com.gstech.saas.platform.tenant.model.TenantStatus;
import com.gstech.saas.platform.tenant.repository.TenantRepository;
import com.gstech.saas.platform.tenant.service.TenantPersistenceService;
import com.gstech.saas.platform.tenant.service.TenantService;
import com.gstech.saas.platform.subscription.model.Subscription;
import com.gstech.saas.platform.subscription.model.SubscriptionPlan;
import com.gstech.saas.platform.subscription.model.SubscriptionStatus;
import com.gstech.saas.platform.subscription.repository.SubscriptionRepository;
import com.gstech.saas.platform.user.dto.*;
import com.gstech.saas.platform.user.model.*;
import com.gstech.saas.platform.user.repository.PasswordResetTokenRepository;
import com.gstech.saas.platform.user.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import com.gstech.saas.bootstrap.DataSeeder;

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
@Slf4j
public class UserService {

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    private final UserRepository              repo;
    private final JwtTokenProvider            jwtTokenProvider;
    private final PasswordEncoder             encoder;
    private final AuditService                auditService;
    private final RefreshTokenRepository      refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final MailService                 mailService;
    private final TenantService               tenantService;
    private final TenantRepository            tenantRepository;
    private final TenantPersistenceService    tenantPersistenceService; // commits tenant in own tx
    private final SubscriptionRepository      subscriptionRepository;
    private final DataSeeder                  dataSeeder;

    // ═══════════════════════════════════════════════════════════════════════
    // REGISTER
    // NOT @Transactional — each step (tenant, subscription, user) commits
    // independently so that DataSeeder.seedTenant() (REQUIRES_NEW) can see
    // the committed Tenant row via READ COMMITTED on its new connection.
    // ═══════════════════════════════════════════════════════════════════════
    public UserResponse register(RegisterRequest req) {

        Long tenantId = TenantContext.get();

        if (tenantId == null) {
            throw new RuntimeException("Tenant not resolved");
        }

        // Self-signup: TenantContext=0 means localhost or no subdomain
        if (tenantId == 0L) {
            tenantId = createTenantForSignup(req);
        } else {
            if (repo.existsByEmailAndTenantId(req.email(), tenantId)) {
                throw new RuntimeException("User already exists");
            }
        }

        User user = new User();
        user.setEmail(req.email());
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setPassword(encoder.encode(req.password()));
        user.setRole(req.role() != null ? req.role() : Role.TENANT_ADMIN);
        user.setStatus(UserStatus.ACTIVE);
        user.setTenantId(tenantId);

        User saved = repo.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getEmail(),
                saved.getRole(),
                saved.getStatus()
        );
    }

    /**
     * Creates Tenant + Subscription, then seeds default data.
     *
     * Commit order:
     *  1. TenantPersistenceService.saveTenant()  — REQUIRES_NEW → committed immediately
     *  2. subscriptionRepository.save()           — auto-commits (no outer @Transactional)
     *  3. DataSeeder.seedTenant()                 — REQUIRES_NEW → sees committed Tenant row
     *
     * Returns the new tenant's id.
     */
    private Long createTenantForSignup(RegisterRequest req) {

        // Guard: company name must be unique
        if (tenantRepository.existsByNameIgnoreCase(req.companyName())) {
            throw new ResponseStatusException(
                    HttpStatusCode.valueOf(409),
                    "A company with this name already exists. Please use a different company name.");
        }

        String base      = req.companyName()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        String subdomain = base + "-" + System.currentTimeMillis();

        Tenant tenant = new Tenant();
        tenant.setName(req.companyName());
        tenant.setSubdomain(subdomain);
        tenant.setStatus(TenantStatus.ACTIVE);
        tenant.setAccountOwner(req.firstName() + " " + req.lastName());
        if (req.streetAddress() != null) tenant.setStreetAddress(req.streetAddress());
        if (req.city()          != null) tenant.setCity(req.city());
        if (req.state()         != null) tenant.setState(req.state());
        if (req.zipCode()       != null) tenant.setZipCode(req.zipCode());
        if (req.phone()         != null) tenant.setPhone(req.phone());
        if (req.companyEmail()  != null) tenant.setEmail(req.companyEmail());
        if (req.accountUrl()    != null) tenant.setAccountUrl(req.accountUrl());

        // STEP 1 — commit tenant in its own transaction so seeder can see it
        Long newTenantId = tenantPersistenceService.saveTenant(tenant);
        log.info("New tenant created: id={}, name={}, subdomain={}", newTenantId, tenant.getName(), subdomain);

        // STEP 2 — save subscription (auto-commits, no outer tx)
        Subscription subscription = new Subscription();
        subscription.setTenantId(newTenantId);
        subscription.setUnitLimit(15);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setPlanName("Free Trial");
        subscription.setPlan(SubscriptionPlan.FREE);
        subscription.setPlanSelected(false);
        subscriptionRepository.save(subscription);

        // STEP 3 — seed default data in its own transaction (REQUIRES_NEW)
        // Tenant row is already committed above, so FK check passes.
        try {
            tenantService.seedNewTenant(newTenantId);
        } catch (Exception e) {
            log.warn("Seed failed for tenantId={}: {} — registration will still succeed",
                    newTenantId, e.getMessage());
        }

        return newTenantId;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // LOGIN
    // ═══════════════════════════════════════════════════════════════════════
    @Transactional
    public LoginResponse login(LoginRequest req, HttpServletResponse response) {

        Long tenantId = TenantContext.get();
        if (tenantId == null) throw new RuntimeException("Tenant not resolved");

        // On localhost TenantResolver returns 0L (no subdomain).
        // Real users have their actual tenantId — look up by email alone,
        // then read tenantId from the user row for correct JWT generation.
        User user;
        if (tenantId == 0L) {
            user = repo.findFirstByEmail(req.email())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatusCode.valueOf(404), "User not found"));
            tenantId = user.getTenantId();
        } else {
            user = repo.findByEmailAndTenantId(req.email(), tenantId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatusCode.valueOf(404), "User not found"));
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(403), "User is inactive");
        }

        if (Boolean.TRUE.equals(user.getTemporaryPassword())) {
            if (user.getTempPasswordExpiry() != null &&
                    user.getTempPasswordExpiry().isBefore(Instant.now())) {
                throw new ResponseStatusException(HttpStatusCode.valueOf(403),
                        "Temporary password expired. Please reset your password.");
            }
        }

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String accessToken = jwtTokenProvider.generateToken(
                tenantId, user.getEmail(), user.getRole().name(), user.getId());

        auditService.log(LOGIN.name(), "User", user.getId(), user.getId());
        refreshTokenRepository.revokeAllByUserId(user.getId());
        issueRefreshTokenCookie(user.getId(), tenantId, response);

        Subscription sub = subscriptionRepository.findByTenantId(tenantId);
        boolean planSelected = sub != null && sub.isPlanSelected();

        return new LoginResponse(accessToken, user.getRole().name(), planSelected);
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

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = repo.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String newAccessToken = jwtTokenProvider.generateToken(
                stored.getTenantId(), user.getEmail(), user.getRole().name(), user.getId());

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
        if (tenantId == null) throw new RuntimeException("Tenant not resolved");
        return repo.findAllByTenantId(tenantId).stream().map(this::toResponse).toList();
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
        if (tenantId == null) throw new RuntimeException("Tenant not resolved");
        if (repo.existsByEmailAndTenantId(req.email(), tenantId))
            throw new RuntimeException("User already exists");

        String tempPassword = generateTempPassword();
        User user = new User();
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setEmail(req.email());
        user.setPassword(encoder.encode(tempPassword));
        user.setRole(req.role());
        user.setTenantId(tenantId);
        user.setStatus(UserStatus.ACTIVE);
        user.setTemporaryPassword(true);
        user.setTempPasswordExpiry(Instant.now().plus(24, ChronoUnit.HOURS));

        User saved = repo.save(user);
        passwordResetTokenRepository.markAllUsedByUserId(saved.getId());

        String rawToken   = UUID.randomUUID().toString();
        String tokenHash  = sha256Hex(rawToken);
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(saved.getId());
        resetToken.setTenantId(tenantId);
        resetToken.setTokenHash(tokenHash);
        resetToken.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);

        String resetLink = frontendBaseUrl + "/reset-password?token=" + rawToken;
        mailService.sendInviteEmail(saved.getEmail(),
                saved.getFirstName() + " " + saved.getLastName(),
                tempPassword, resetLink);

        return toResponse(saved);
    }

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

    public List<RoleResponse> getRoles() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) throw new RuntimeException("Tenant not resolved");
        return List.of(
                buildRoleResponse(Role.TENANT_ADMIN, "Full Access", tenantId),
                buildRoleResponse(Role.MANAGER,      "Read/Write",  tenantId),
                buildRoleResponse(Role.VIEWER,        "Read Only",   tenantId)
        );
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private String issueRefreshTokenCookie(Long userId, Long tenantId,
                                           HttpServletResponse response) {
        UUID tokenId = UUID.randomUUID();
        String refreshJwt = jwtTokenProvider.generateRefreshToken(userId, tokenId);
        RefreshToken rt = new RefreshToken();
        rt.setUserId(userId);
        rt.setTenantId(tenantId);
        rt.setTokenHash(sha256Hex(refreshJwt));
        rt.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshTokenRepository.save(rt);

        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshJwt)
                .httpOnly(true).secure(false).sameSite("Strict")
                .path("/users/refresh").maxAge(Duration.ofDays(7)).build();
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
        return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole(), user.getStatus());
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