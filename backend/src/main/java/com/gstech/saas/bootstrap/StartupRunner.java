package com.gstech.saas.bootstrap;

import com.gstech.saas.platform.security.Role;
import com.gstech.saas.platform.user.model.User;
import com.gstech.saas.platform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StartupRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${platform.admin.email}")
    private String adminEmail;

    @Value("${platform.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {

        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.PLATFORM_ADMIN);
        admin.setTenantId(0L); // platform-level user

        userRepository.save(admin);
    }
}
