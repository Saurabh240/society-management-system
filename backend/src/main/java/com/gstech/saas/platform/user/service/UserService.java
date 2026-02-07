package com.gstech.saas.platform.user.service;

import com.gstech.saas.platform.security.JwtTokenProvider;
import com.gstech.saas.platform.user.model.LoginRequest;
import com.gstech.saas.platform.user.model.LoginResponse;
import com.gstech.saas.platform.user.model.RegisterRequest;
import com.gstech.saas.platform.user.model.UserResponse;
import com.gstech.saas.platform.user.model.User;
import com.gstech.saas.platform.user.repository.UserRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repo;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UserService(UserRepository repo, JwtTokenProvider jwtTokenProvider) {
        this.repo = repo;
        this.jwtTokenProvider = jwtTokenProvider;
    }

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
        user.setRole("TENANT_ADMIN"); // default role for now

        User saved = repo.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getRole()
        );
    }

    public LoginResponse login(LoginRequest req) {

        Long tenantId = TenantContext.get();

        User user = repo.findByEmailAndTenantId(req.email(), tenantId)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtTokenProvider.generateToken(
                tenantId,
                user.getEmail(),
                user.getRole()
        );

        return new LoginResponse(
                token,
                user.getRole()
        );

    }
}

