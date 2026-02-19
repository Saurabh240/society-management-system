package com.gstech.saas.platform.user.service;

import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.security.JwtTokenProvider;
import com.gstech.saas.platform.security.Role;
import com.gstech.saas.platform.user.model.*;
import com.gstech.saas.platform.user.repository.UserRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder encoder;
    private final AuditService auditService;

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
        user.setRole(Role.TENANT_ADMIN);   // default role
        user.setTenantId(tenantId);        // IMPORTANT

        User saved = repo.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getRole() // return as String
        );
    }

    // ================= LOGIN =================
    public LoginResponse login(LoginRequest req) {

        // Step 1: Find user by email ONLY
        User user = repo.findByEmail(req.email())
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid credentials")
                );

        // Step 2: Validate password
        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        // Step 3: If NOT platform admin → validate tenant
        if (user.getRole() != Role.PLATFORM_ADMIN) {

            Long tenantId = TenantContext.get();

            if (tenantId == null || !tenantId.equals(user.getTenantId())) {
                throw new BadCredentialsException("Invalid credentials");
            }
        }

        // Step 4: Generate token
        String token = jwtTokenProvider.generateToken(
                user.getTenantId(),   // 0L for platform admin
                user.getEmail(),
                user.getRole().name()
        );

        // Step 5: Audit
        auditService.log(
                "LOGIN",
                "User",
                user.getId(),
                user.getId()
        );

        return new LoginResponse(
                token,
                user.getRole().name()
        );
    }

}
