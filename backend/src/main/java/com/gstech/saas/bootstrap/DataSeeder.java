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
            linkSeededBankAccountsToGl(tenantId);
            log.info("[DataSeeder] Seed complete for tenantId={}", tenantId);
        } catch (Exception e) {
            log.warn("[DataSeeder] Seed failed for tenantId={}: {} — registration already succeeded",
                    tenantId, e.getMessage());
            throw new RuntimeException("Seed failed", e);
        }
    }

    /**
     * seed_tenant_data() inserts the default "Operating Account" bank account
     * without a coa_account_id, and V12's backfill only covered bank accounts
     * that existed when it ran. Without a linked GL account, every bill payment
     * and unit payment for a freshly onboarded tenant fails with "Bank account
     * has no linked COA account". Give each unlinked bank account of this
     * tenant its own GL account, exactly like BankingServiceImpl.createAccount().
     */
    private void linkSeededBankAccountsToGl(Long tenantId) {
        jdbcTemplate.update("""
                INSERT INTO chart_of_accounts
                    (tenant_id, account_code, account_name, account_type, notes, is_deleted, created_at)
                SELECT b.tenant_id, 'BANK-' || b.id,
                       COALESCE(b.bank_account_name, 'Bank Account ' || b.id),
                       'ASSETS', 'Auto-created GL account for bank account', false, NOW()
                FROM bank_accounts b
                WHERE b.tenant_id = ? AND b.coa_account_id IS NULL
                ON CONFLICT (tenant_id, account_code) DO NOTHING
                """, tenantId);
        jdbcTemplate.update("""
                UPDATE bank_accounts b
                SET coa_account_id = c.id
                FROM chart_of_accounts c
                WHERE b.tenant_id = ? AND b.coa_account_id IS NULL
                  AND c.tenant_id = b.tenant_id AND c.account_code = 'BANK-' || b.id
                """, tenantId);
    }
}