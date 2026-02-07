package com.gstech.saas.platform.Tenant.repository;

import com.gstech.saas.platform.Tenant.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findBySubdomain(String subdomain);
}
