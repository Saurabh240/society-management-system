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
 * Called from {@link com.gstech.saas.platform.tenant.service.TenantService#createTenant}
 * after the tenant and admin user are persisted.
 *
 * Seeds:
 *   - 12 default Chart of Accounts entries (standard HOA accounts)
 *   - 1 sample Association ("Sample HOA Community")
 *   - 2 sample Units (101, 102)
 *   - 1 sample Owner linked to Unit 101
 *   - 1 placeholder Bank Account (routing/account numbers must be updated)
 *   - 3 Communication Templates (fee reminder, welcome, board meeting)
 *
 * Uses the PostgreSQL stored procedure {@code seed_tenant_data(bigint)}
 * defined in V35__create_tenant_seed_data_procedure.sql.
 *
 * The seeding runs in its own transaction (REQUIRES_NEW) so that a seed
 * failure does NOT roll back the tenant registration itself — the tenant
 * is always created, seed data is best-effort.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Seeds all default data for the given tenant.
     * Runs in a separate transaction so failures are isolated.
     *
     * @param tenantId the newly registered tenant's ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void seedTenant(Long tenantId) {
        try {
            log.info("[DataSeeder] Seeding default data for tenantId={}", tenantId);
            jdbcTemplate.execute("CALL seed_tenant_data(" + tenantId + ")");
            log.info("[DataSeeder] Seed complete for tenantId={}", tenantId);
        } catch (Exception e) {
            // Log but don't rethrow — tenant registration must succeed even if seeding fails
            log.error("[DataSeeder] Failed to seed data for tenantId={}: {}", tenantId, e.getMessage(), e);
        }
    }
}