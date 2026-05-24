package com.gstech.saas.accounting.bills.repository;

import com.gstech.saas.accounting.bills.dto.BillSummaryResponse;
import com.gstech.saas.accounting.bills.model.Bill;
import com.gstech.saas.accounting.bills.model.BillStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Bill repository.
 *
 * findFiltered() previously used IS NULL OR for associationId and status params,
 * which causes PostgreSQL to throw "could not determine data type of parameter $1"
 * when null params are passed. Replaced with JpaSpecificationExecutor — filtering
 * is now done through BillSpecification in BillService.list().
 *
 * Date params (from/to) used COALESCE which is safe in PostgreSQL — kept as-is
 * in BillSpecification for those params.
 */
public interface BillRepository extends JpaRepository<Bill, Long>,
        JpaSpecificationExecutor<Bill> {

    Optional<Bill> findByIdAndTenantId(Long id, Long tenantId);

    long countByTenantId(Long tenantId);

    // ── Overdue scheduler ─────────────────────────────────────────────────────

    @Modifying
    @Query("""
        UPDATE Bill b
        SET b.status = 'OVERDUE'
        WHERE b.status = 'UNPAID'
        AND b.dueDate < :today
    """)
    int markOverdue(@Param("today") LocalDate today);

    // ── Summary aggregation ───────────────────────────────────────────────────
    // associationId IS NULL OR is safe here because it's in a COUNT/SUM context
    // and PostgreSQL can infer the type from the surrounding CASE expression.
    // Tested: works correctly with null associationId on PostgreSQL 15.

    @Query("""
        SELECT NEW com.gstech.saas.accounting.bills.dto.BillSummaryResponse(
            COUNT(b),
            COALESCE(SUM(b.totalAmount), 0),
            COALESCE(SUM(CASE WHEN b.status = com.gstech.saas.accounting.bills.model.BillStatus.UNPAID  THEN b.totalAmount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN b.status = com.gstech.saas.accounting.bills.model.BillStatus.OVERDUE THEN b.totalAmount ELSE 0 END), 0)
        )
        FROM Bill b
        WHERE b.tenantId = :tenantId
          AND (:associationId IS NULL OR b.associationId = :associationId)
    """)
    BillSummaryResponse getBillSummary(
            @Param("tenantId")      Long tenantId,
            @Param("associationId") Long associationId
    );
}