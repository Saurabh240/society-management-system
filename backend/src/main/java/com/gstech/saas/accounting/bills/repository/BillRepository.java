package com.gstech.saas.accounting.bills.repository;

import com.gstech.saas.accounting.bills.dto.BillSummaryResponse;
import com.gstech.saas.accounting.bills.model.Bill;
import com.gstech.saas.accounting.bills.model.BillStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {

    Optional<Bill> findByIdAndTenantId(Long id, Long tenantId);

    long countByTenantId(Long tenantId);

    @Query("""
    SELECT b FROM Bill b
    WHERE b.tenantId = :tenantId
      AND (:associationId IS NULL OR b.associationId = :associationId)
      AND (:status IS NULL OR b.status = :status)
      AND b.issueDate >= COALESCE(:from, b.issueDate)
      AND b.issueDate <= COALESCE(:to, b.issueDate)
""")
    Page<Bill> findFiltered(
            Long tenantId,
            Long associationId,
            BillStatus status,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    );

    @Modifying
    @Query("""
    UPDATE Bill b
    SET b.status = 'OVERDUE'
    WHERE b.status = 'UNPAID'
    AND b.dueDate < :today
""")
    int markOverdue(LocalDate today);

    @Query("""
    SELECT NEW com.gstech.saas.accounting.bills.dto.BillSummaryResponse(
        COUNT(b),
        COALESCE(SUM(b.totalAmount), 0),
        COALESCE(SUM(CASE WHEN b.status = com.gstech.saas.accounting.bills.model.BillStatus.UNPAID THEN b.totalAmount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN b.status = com.gstech.saas.accounting.bills.model.BillStatus.OVERDUE THEN b.totalAmount ELSE 0 END), 0)
    )
    FROM Bill b
    WHERE b.tenantId = :tenantId
      AND (:associationId IS NULL OR b.associationId = :associationId)
""")
    BillSummaryResponse getBillSummary(Long tenantId, Long associationId);
}
