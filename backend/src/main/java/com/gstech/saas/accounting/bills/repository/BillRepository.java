package com.gstech.saas.accounting.bills.repository;

import com.gstech.saas.accounting.bills.dto.BillSummaryResponse;
import com.gstech.saas.accounting.bills.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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

    /**
     * Bills within a date range, optionally filtered by vendorId and associationId.
     * Used for the main transaction rows in the Vendor Ledger report.
     */
    @Query("""
    SELECT b FROM Bill b
    WHERE b.tenantId = :tenantId
      AND (:associationId IS NULL OR b.associationId = :associationId)
      AND (:vendorId     IS NULL OR b.vendorId      = :vendorId)
      AND b.issueDate >= :from
      AND b.issueDate <= :to
    ORDER BY b.vendorId ASC, b.issueDate ASC
""")
    List<Bill> findForVendorLedger(
            @Param("tenantId")      Long      tenantId,
            @Param("associationId") Long      associationId,
            @Param("vendorId")      Long      vendorId,
            @Param("from")          LocalDate from,
            @Param("to")            LocalDate to
    );

    /**
     * Unpaid/Overdue bills strictly BEFORE the from-date, per vendor.
     * These form the opening balance for each vendor.
     * Returns Object[]: [vendorId, sum(totalAmount)]
     */
    @Query("""
    SELECT b.vendorId, COALESCE(SUM(b.totalAmount), 0)
    FROM Bill b
    WHERE b.tenantId = :tenantId
      AND (:associationId IS NULL OR b.associationId = :associationId)
      AND (:vendorId     IS NULL OR b.vendorId      = :vendorId)
      AND b.issueDate < :from
      AND b.status IN (
            com.gstech.saas.accounting.bills.model.BillStatus.UNPAID,
            com.gstech.saas.accounting.bills.model.BillStatus.OVERDUE
          )
    GROUP BY b.vendorId
""")
    List<Object[]> findOpeningBalancesByVendor(
            @Param("tenantId")      Long      tenantId,
            @Param("associationId") Long      associationId,
            @Param("vendorId")      Long      vendorId,
            @Param("from")          LocalDate from
    );
}