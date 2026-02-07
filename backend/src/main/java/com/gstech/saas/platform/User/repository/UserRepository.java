package com.gstech.saas.platform.User.repository;

import com.gstech.saas.platform.User.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndTenantId(String email, Long tenantId);

    boolean existsByEmailAndTenantId(String email, Long tenantId);
}


