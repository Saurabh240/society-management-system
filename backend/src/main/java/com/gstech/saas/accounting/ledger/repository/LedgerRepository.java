package com.gstech.saas.accounting.ledger.repository;

import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.dto.LedgerSourceType;
import com.gstech.saas.accounting.ledger.model.Ledger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Single query handles all filter combinations.
 * Each param is optional — passing null skips that filter.
 */
@Repository
public interface LedgerRepository extends JpaRepository<Ledger, Long>,
        JpaSpecificationExecutor<Ledger> {

    @Query("""
SELECT COALESCE(SUM(l.credit), 0)
FROM Ledger l
JOIN Coa c ON c.id = l.accountId
WHERE l.tenantId = :tenantId
  AND c.tenantId = :tenantId
  AND c.accountType = :accountType
  AND c.isDeleted = false
  AND l.associationId = COALESCE(:associationId, l.associationId)
  AND l.date >= COALESCE(:from, l.date)
  AND l.date <= COALESCE(:to, l.date)
""")
    BigDecimal sumCreditByAccountType(
            @Param("tenantId") Long tenantId,
            @Param("accountType") AccountType accountType,
            @Param("associationId") Long associationId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
SELECT COALESCE(SUM(l.debit), 0)
FROM Ledger l
JOIN Coa c ON c.id = l.accountId
WHERE l.tenantId = :tenantId
  AND c.tenantId = :tenantId
  AND c.accountType = :accountType
  AND c.isDeleted = false
  AND l.associationId = COALESCE(:associationId, l.associationId)
  AND l.date >= COALESCE(:from, l.date)
  AND l.date <= COALESCE(:to, l.date)
""")
    BigDecimal sumDebitByAccountType(
            @Param("tenantId") Long tenantId,
            @Param("accountType") AccountType accountType,
            @Param("associationId") Long associationId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
SELECT COALESCE(SUM(l.debit), 0)
FROM Ledger l
WHERE l.tenantId = :tenantId
  AND l.associationId = :associationId
""")
    BigDecimal sumDebitByAssociation(
            @Param("tenantId") Long tenantId,
            @Param("associationId") Long associationId
    );

    @Query("""
SELECT COALESCE(SUM(l.credit), 0)
FROM Ledger l
WHERE l.tenantId = :tenantId
  AND l.associationId = :associationId
""")
    BigDecimal sumCreditByAssociation(
            @Param("tenantId") Long tenantId,
            @Param("associationId") Long associationId
    );

    // ── Unit-scoped sums (UnitLedgerServiceImpl.getSummary) ─────────────────
    // Scoped to a single unit AND a single accountingBasis AND a single
    // sourceType so a payment's dual-basis "cash hits the bank" line (which
    // JournalService posts once per basis - see V16) is never double-counted,
    // and so one unit's charges/payments are never mixed with another unit's
    // in the same association (the bug behind GET /units/{id}/ledger/summary
    // returning association-wide totals instead of this unit's own).
    @Query("""
SELECT COALESCE(SUM(l.debit), 0)
FROM Ledger l
WHERE l.tenantId = :tenantId
  AND l.unitId = :unitId
  AND l.accountingBasis = :basis
  AND l.sourceType = :sourceType
""")
    BigDecimal sumDebitByUnitBasisAndSourceType(
            @Param("tenantId")   Long tenantId,
            @Param("unitId")     Long unitId,
            @Param("basis")      AccountingBasis basis,
            @Param("sourceType") LedgerSourceType sourceType
    );

    @Query("""
SELECT COALESCE(SUM(l.credit), 0)
FROM Ledger l
WHERE l.tenantId = :tenantId
  AND l.unitId = :unitId
  AND l.accountingBasis = :basis
  AND l.sourceType = :sourceType
""")
    BigDecimal sumCreditByUnitBasisAndSourceType(
            @Param("tenantId")   Long tenantId,
            @Param("unitId")     Long unitId,
            @Param("basis")      AccountingBasis basis,
            @Param("sourceType") LedgerSourceType sourceType
    );

    @Query("""
    SELECT l.date, l.description, l.credit
    FROM Ledger l
    WHERE l.tenantId = :tenantId
      AND l.associationId = :associationId
      AND l.credit > 0
      AND l.date BETWEEN :from AND :to
    ORDER BY l.date ASC
""")
    List<Object[]> findCreditEntriesByAssociationAndDateRange(
            @Param("tenantId")      Long      tenantId,
            @Param("associationId") Long      associationId,
            @Param("from")          LocalDate from,
            @Param("to")            LocalDate to);

    @Query("""
SELECT COALESCE(SUM(l.credit), 0)
FROM Ledger l
WHERE l.tenantId = :tenantId
  AND l.associationId = :associationId
  AND l.date BETWEEN :from AND :to
""")
    BigDecimal sumCreditByAssociationAndDateRange(
            @Param("tenantId")      Long      tenantId,
            @Param("associationId") Long      associationId,
            @Param("from")          LocalDate from,
            @Param("to")            LocalDate to);

}