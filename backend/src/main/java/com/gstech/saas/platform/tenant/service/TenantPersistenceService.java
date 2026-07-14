package com.gstech.saas.platform.tenant.service;

import com.gstech.saas.platform.tenant.model.Tenant;
import com.gstech.saas.platform.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Dedicated service for committing Tenant rows in their own transaction.
 *
 * WHY THIS EXISTS:
 * DataSeeder.seedTenant() uses REQUIRES_NEW, which opens a new DB connection.
 * Postgres READ COMMITTED isolation means it can only see COMMITTED rows.
 * If the Tenant INSERT is in the same uncommitted transaction as the seed call,
 * the FK check in seed_tenant_data() fails with:
 *   "Key (tenant_id)=(N) is not present in table tenants"
 *
 * By saving the Tenant in REQUIRES_NEW here, the row is committed to the DB
 * before DataSeeder.seedTenant() is called, making it visible to the seeder's
 * new independent connection.
 *
 * USAGE: call saveTenant() first, capture the returned id, then call
 * DataSeeder.seedTenant(id). Both operations are independent committed units.
 */
@Service
@RequiredArgsConstructor
public class TenantPersistenceService {

    private final TenantRepository tenantRepository;

    /**
     * Saves and COMMITS a Tenant row in its own transaction.
     * Returns the auto-generated tenant id.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Long saveTenant(Tenant tenant) {
        return tenantRepository.save(tenant).getId();
    }
}