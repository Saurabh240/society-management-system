package com.gstech.saas.accounting.ledger.repository;

import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
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
    }
