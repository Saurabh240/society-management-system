package com.gstech.saas.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.Savepoint;

/**
 * Seeds default data for a newly registered tenant.
 *
 * TRANSACTION DESIGN:
 *
 * Problem: we need the new Tenant row visible to the seed procedure
 * (FK constraint), but we also need seed errors to NOT abort the
 * registration transaction.
 *
 * Solution — REQUIRED propagation + JDBC savepoint:
 *   - REQUIRED: joins the caller's transaction so the Tenant row (flushed
 *     by JPA before this call) is visible on the same DB connection.
 *   - Savepoint: wraps the CALL in a savepoint. If the procedure throws,
 *     we rollback to the savepoint — undoing only the seed work — and the
 *     outer transaction remains open and clean. Registration completes.
 *
 * Why not REQUIRES_NEW:
 *   REQUIRES_NEW opens a new connection/transaction. The new Tenant row is
 *   in the outer uncommitted transaction and is invisible to the new one,
 *   causing the FK violation we had before.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final JdbcTemplate jdbcTemplate;

    @Transactional(propagation = Propagation.REQUIRED)
    public void seedTenant(Long tenantId) {
        log.info("[DataSeeder] Seeding default data for tenantId={}", tenantId);

        jdbcTemplate.execute((Connection conn) -> {
            Savepoint savepoint = null;
            try {
                savepoint = conn.setSavepoint("seed_" + tenantId);
                try (var stmt = conn.createStatement()) {
                    stmt.execute("CALL seed_tenant_data(" + tenantId + ")");
                }
                log.info("[DataSeeder] Seed complete for tenantId={}", tenantId);
            } catch (Exception e) {
                // Roll back only the seed work — the outer transaction
                // (Tenant + User + Subscription inserts) stays intact.
                if (savepoint != null) {
                    try {
                        conn.releaseSavepoint(savepoint);
                        log.warn("[DataSeeder] Seed rolled back for tenantId={}: {} " +
                                "— registration will still succeed", tenantId, e.getMessage());
                    } catch (Exception rollbackEx) {
                        log.error("[DataSeeder] Savepoint rollback failed for tenantId={}: {}",
                                tenantId, rollbackEx.getMessage());
                    }
                } else {
                    log.warn("[DataSeeder] Seed failed (no savepoint) for tenantId={}: {}",
                            tenantId, e.getMessage());
                }
            }
            return null;
        });
    }
}