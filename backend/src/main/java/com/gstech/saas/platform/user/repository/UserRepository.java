package com.gstech.saas.platform.user.repository;

import com.gstech.saas.platform.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmailAndTenantId(String email, Long tenantId);
    boolean existsByEmail(String email);

}


