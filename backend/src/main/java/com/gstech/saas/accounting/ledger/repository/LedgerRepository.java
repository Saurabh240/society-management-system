package com.gstech.saas.accounting.ledger.repository;

import com.gstech.saas.accounting.ledger.model.Ledger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LedgerRepository extends JpaRepository<Ledger, Long> {

    /**
     * Flexible filter query — all params are optional.
     * The ":param IS NULL OR" pattern short-circuits when a param is not provided,
     * giving one query method that handles every combination of filters.
     */
    @Query("""
        SELECT l FROM Ledger l
        WHERE l.tenantId = :tenantId
          AND (:associationId IS NULL OR l.associationId = :associationId)
          AND (:accountId     IS NULL OR l.accountId     = :accountId)
          AND (:fromDate      IS NULL OR l.date          >= :fromDate)
          AND (:toDate        IS NULL OR l.date          <= :toDate)
          AND (:basis         IS NULL OR l.accountingBasis = :basis)
        ORDER BY l.date DESC, l.id DESC
        """)
    List<Ledger> findFiltered(
        @Param("tenantId")      Long tenantId,
        @Param("associationId") Long associationId,
        @Param("accountId")     Long accountId,
        @Param("fromDate")      LocalDate fromDate,
        @Param("toDate")        LocalDate toDate,
        @Param("basis")         String basis
    );

    // ── Used for Overview stats ────────────────────────────────────────────────

    /**
     * Sum of credit amounts for a given account type (e.g. "INCOME" → total revenue).
     * Joins to chart_of_accounts to filter by accountType.
     */
    @Query("""
        SELECT COALESCE(SUM(l.credit), 0)
        FROM Ledger l
        JOIN Coa c ON l.accountId = c.id
        WHERE l.tenantId = :tenantId
          AND c.accountType = :accountType
        """)
    BigDecimal sumCreditByAccountType(
        @Param("tenantId")    Long tenantId,
        @Param("accountType") String accountType
    );

    /**
     * Sum of debit amounts for a given account type (e.g. "EXPENSES" → total expenses).
     */
    @Query("""
        SELECT COALESCE(SUM(l.debit), 0)
        FROM Ledger l
        JOIN Coa c ON l.accountId = c.id
        WHERE l.tenantId = :tenantId
          AND c.accountType = :accountType
        """)
    BigDecimal sumDebitByAccountType(
        @Param("tenantId")    Long tenantId,
        @Param("accountType") String accountType
    );
}
