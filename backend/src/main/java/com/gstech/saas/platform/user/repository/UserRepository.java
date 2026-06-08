package com.gstech.saas.platform.user.repository;

import com.gstech.saas.platform.security.Role;
import com.gstech.saas.platform.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndTenantId(String email, Long tenantId);

    boolean existsByEmailAndTenantId(String email, Long tenantId);

    boolean existsByTenantIdAndEmailAndIdNot(Long tenantId, String email, Long id);

    /** Returns all users for the tenant EXCEPT those with PLATFORM_ADMIN role.
     *  Prevents platform admins from appearing in tenant user management tables. */
    List<User> findAllByTenantIdAndRoleNot(Long tenantId, Role excludedRole);

    /** Kept for internal auth use only — NOT used by user-management endpoints. */
    List<User> findAllByTenantId(Long tenantId);

    Optional<User> findByIdAndTenantId(Long id, Long tenantId);

    long countByRoleAndTenantId(Role role, Long tenantId);
}