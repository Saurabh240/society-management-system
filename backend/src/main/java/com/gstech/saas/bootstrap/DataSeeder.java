package com.gstech.saas.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds default data for a newly registered tenant.
 *
 * TRANSACTION DESIGN — REQUIRES_NEW:
 *
 * This method MUST run in its own independent transaction so that:
 *  1. The Tenant row committed by the caller is visible (READ COMMITTED).
 *  2. A seed failure rolls back only the seed data, never the registration.
 *
 * The caller (UserService.createTenantForSignup) MUST commit the Tenant row
 * BEFORE calling this method. It does this by:
 *   a. Saving the Tenant in a @Transactional(REQUIRES_NEW) helper method, OR
 *   b. Having register() be non-@Transactional so each repo.save() auto-commits.
 *
 * See UserService.createTenantForSignup() — the Tenant is saved via
 * TenantPersistenceService.saveTenant() which uses REQUIRES_NEW, committing
 * the row before this method is called.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final JdbcTemplate jdbcTemplate;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void seedTenant(Long tenantId) {
        try {
            log.info("[DataSeeder] Seeding default data for tenantId={}", tenantId);
            jdbcTemplate.execute("CALL seed_tenant_data(" + tenantId + ")");
            log.info("[DataSeeder] Seed complete for tenantId={}", tenantId);
        } catch (Exception e) {
            log.warn("[DataSeeder] Seed failed for tenantId={}: {} — registration already succeeded",
                    tenantId, e.getMessage());
            throw new RuntimeException("Seed failed", e);
        }
    }
}