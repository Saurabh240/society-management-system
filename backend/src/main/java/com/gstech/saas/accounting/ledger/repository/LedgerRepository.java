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
      AND (:associationId IS NULL OR l.associationId = :associationId)
      AND (:from IS NULL OR l.date >= :from)
      AND (:to IS NULL OR l.date <= :to)
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
      AND (:associationId IS NULL OR l.associationId = :associationId)
      AND (:from IS NULL OR l.date >= :from)
      AND (:to IS NULL OR l.date <= :to)
""")
    BigDecimal sumDebitByAccountType(
            @Param("tenantId") Long tenantId,
            @Param("accountType") AccountType accountType,
            @Param("associationId") Long associationId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
    }
