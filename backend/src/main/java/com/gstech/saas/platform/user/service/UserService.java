package com.gstech.saas.platform.user.service;

import static com.gstech.saas.platform.audit.model.AuditEvent.LOGIN;

import com.gstech.saas.platform.tenant.model.Tenant;
import com.gstech.saas.platform.tenant.model.TenantStatus;
import com.gstech.saas.platform.tenant.repository.TenantRepository;
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

    private final UserRepository repo;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder encoder;
    private final AuditService auditService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final MailService mailService;
    private final TenantService tenantService;
    private final SubscriptionRepository subscriptionRepository;
    private final TenantRepository tenantRepository;


    // ================= REGISTER =================
    @Transactional
    public UserResponse register(RegisterRequest req) {

        Long tenantId = TenantContext.get();

        if (tenantId == null) {
            throw new RuntimeException("Tenant not resolved");
        }

        // ── Self-signup path ────────────────────────────────────────────────────
        // TenantResolver returns 0L on localhost (no subdomain) and also when there
        // is no subdomain in production. This means a brand-new company is signing up:
        // create a NEW tenant for them instead of touching the platform tenant (id=0).
        if (tenantId == 0L) {
            tenantId = createTenantForSignup(req);
        } else {
            // ── Invited-user path: joining an existing tenant ───────────────────
            if (repo.existsByEmailAndTenantId(req.email(), tenantId)) {
                throw new RuntimeException("User already exists");
            }
        }

        User user = new User();
        user.setEmail(req.email());
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setPassword(encoder.encode(req.password()));
        Role role = req.role() != null ? req.role() : Role.TENANT_ADMIN;
        user.setRole(role);
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
     * Creates a brand-new Tenant + Subscription for a self-signup request,
     * then seeds default data (CoA, sample association, templates).
     *
     * <p>Called only when TenantContext resolves to 0L, which happens on
     * localhost and whenever the request has no subdomain header.</p>
     *
     * @return the new tenant's auto-generated id
     */
    private Long createTenantForSignup(RegisterRequest req) {

        // Block duplicate company names (case-insensitive)
        if (tenantRepository.existsByNameIgnoreCase(req.companyName())) {
            throw new ResponseStatusException(
                    HttpStatusCode.valueOf(409),
                    "A company with this name already exists. Please use a different company name.");
        }

        // Build a unique subdomain:  "Oakwood HOA" → "oakwood-hoa-1718123456789"
        String base      = req.companyName()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        String subdomain = base + "-" + System.currentTimeMillis();

        // ── Create Tenant ───────────────────────────────────────────────────────
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

        Tenant saved = tenantRepository.save(tenant);
        Long newTenantId = saved.getId();

        log.info("New tenant created: id={}, name={}, subdomain={}",
                newTenantId, tenant.getName(), subdomain);

        // ── Create FREE Subscription (15 units, plan not yet selected) ──────────
        Subscription subscription = new Subscription();
        subscription.setTenantId(newTenantId);
        subscription.setUnitLimit(15);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setPlanName("Free Trial");
        subscription.setPlan(SubscriptionPlan.FREE);
        subscription.setPlanSelected(false); // triggers plan-selection screen after first login
        subscriptionRepository.save(subscription);

        // ── Seed default data (CoA, associations, templates) ────────────────────
        // Runs in a REQUIRES_NEW transaction inside DataSeeder; failures are
        // isolated — the tenant and user are always persisted even if seeding fails.
        try {
            tenantService.seedNewTenant(newTenantId);
        } catch (Exception e) {
            log.warn("Seed failed for tenantId={}: {}", newTenantId, e.getMessage());
        }

        return newTenantId;
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

        auditService.log(LOGIN.name(), "User", user.getId(), user.getId());

        refreshTokenRepository.revokeAllByUserId(user.getId());
        issueRefreshTokenCookie(user.getId(), tenantId, response);

        // Tell the frontend whether the user has already selected a plan.
        // If not, the frontend redirects to /plan-selection after login.
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
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
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
                saved.getFirstName() + " " + saved.getLastName(),
                tempPassword, resetLink);

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

    public List<RoleResponse> getRoles() {

        Long tenantId = TenantContext.get();

        if (tenantId == null) {
            throw new RuntimeException("Tenant not resolved");
        }

        return List.of(
                buildRoleResponse(Role.TENANT_ADMIN, "Full Access", tenantId),
                buildRoleResponse(Role.MANAGER, "Read/Write", tenantId),
                buildRoleResponse(Role.VIEWER, "Read Only", tenantId)
        );
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
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }

    private RoleResponse buildRoleResponse(Role role, String label, Long tenantId) {
        long count = repo.countByRoleAndTenantId(role, tenantId);
        return new RoleResponse(role.name(), label, count);
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