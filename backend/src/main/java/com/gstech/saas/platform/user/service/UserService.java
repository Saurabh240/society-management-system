package com.gstech.saas.platform.user.service;

import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.security.JwtTokenProvider;
import com.gstech.saas.platform.security.Role;
import com.gstech.saas.platform.user.model.*;
import com.gstech.saas.platform.user.repository.UserRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

        Long tenantId = TenantContext.get();

        if (tenantId == null) {
            throw new RuntimeException("Tenant not resolved");
        }

        User user = repo.findByEmailAndTenantId(req.email(), tenantId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatusCode.valueOf(404), "User not found")
                );

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtTokenProvider.generateToken(
                tenantId,
                user.getEmail(),
                user.getRole().name()
        );

        // 🔍 Audit Login
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
