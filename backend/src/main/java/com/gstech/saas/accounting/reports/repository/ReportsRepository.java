package com.gstech.saas.accounting.reports.repository;

import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.model.Ledger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReportsRepository extends JpaRepository<Ledger, Long> {

    /**
     * Fetch all ledger lines up to asOfDate for a specific account type.
     * Supports accountingBasis filter on Ledger entity.
     * Groups by account to get net debit/credit per account.
     */
    @Query("""
        SELECT l.accountId,
               c.accountCode,
               c.accountName,
               COALESCE(SUM(l.debit), 0)  AS totalDebit,
               COALESCE(SUM(l.credit), 0) AS totalCredit
        FROM Ledger l
        JOIN Coa c ON c.id = l.accountId
        WHERE l.tenantId       = :tenantId
          AND c.accountType    = :accountType
          AND c.isDeleted      = false
          AND l.date           <= :asOfDate
          AND l.associationId  = COALESCE(:associationId, l.associationId)
          AND l.accountingBasis = COALESCE(:basis, l.accountingBasis)
        GROUP BY l.accountId, c.accountCode, c.accountName
        ORDER BY c.accountCode
    """)
    List<Object[]> getAccountBalances(
            @Param("tenantId")      Long tenantId,
            @Param("accountType")   AccountType accountType,
            @Param("associationId") Long associationId,
            @Param("asOfDate")      LocalDate asOfDate,
            @Param("basis")         AccountingBasis basis
    );

    /**
     * For Income Statement: get revenue/expense accounts within a date range
     */
    @Query("""
        SELECT l.accountId,
               c.accountCode,
               c.accountName,
               COALESCE(SUM(l.debit), 0)  AS totalDebit,
               COALESCE(SUM(l.credit), 0) AS totalCredit
        FROM Ledger l
        JOIN Coa c ON c.id = l.accountId
        WHERE l.tenantId       = :tenantId
          AND c.accountType    = :accountType
          AND c.isDeleted      = false
          AND l.date           BETWEEN :from AND :to
          AND l.associationId  = COALESCE(:associationId, l.associationId)
          AND l.accountingBasis = COALESCE(:basis, l.accountingBasis)
        GROUP BY l.accountId, c.accountCode, c.accountName
        ORDER BY c.accountCode
    """)
    List<Object[]> getIncomeStatementAccounts(
            @Param("tenantId")      Long tenantId,
            @Param("accountType")   AccountType accountType,
            @Param("associationId") Long associationId,
            @Param("from")          LocalDate from,
            @Param("to")            LocalDate to,
            @Param("basis")         AccountingBasis basis
    );

    /**
     * For Trial Balance: get all accounts with debits/credits within a date range
     */
    @Query("""
        SELECT l.accountId,
               c.accountCode,
               c.accountName,
               c.accountType,
               COALESCE(SUM(l.debit), 0)  AS totalDebit,
               COALESCE(SUM(l.credit), 0) AS totalCredit
        FROM Ledger l
        JOIN Coa c ON c.id = l.accountId
        WHERE l.tenantId       = :tenantId
          AND c.isDeleted      = false
          AND l.date           BETWEEN :from AND :to
          AND l.associationId  = COALESCE(:associationId, l.associationId)
          AND l.accountingBasis = COALESCE(:basis, l.accountingBasis)
        GROUP BY l.accountId, c.accountCode, c.accountName, c.accountType
        ORDER BY c.accountCode
    """)
    List<Object[]> getTrialBalanceAccounts(
            @Param("tenantId")      Long tenantId,
            @Param("associationId") Long associationId,
            @Param("from")          LocalDate from,
            @Param("to")            LocalDate to,
            @Param("basis")         AccountingBasis basis
    );

    /**
     * For Trial Balance: get a specific account by ID if provided
     */
    @Query("""
        SELECT l.accountId,
               c.accountCode,
               c.accountName,
               c.accountType,
               COALESCE(SUM(l.debit), 0)  AS totalDebit,
               COALESCE(SUM(l.credit), 0) AS totalCredit
        FROM Ledger l
        JOIN Coa c ON c.id = l.accountId
        WHERE l.tenantId       = :tenantId
          AND c.isDeleted      = false
          AND l.accountId      = :accountId
          AND l.date           BETWEEN :from AND :to
          AND l.associationId  = COALESCE(:associationId, l.associationId)
          AND l.accountingBasis = COALESCE(:basis, l.accountingBasis)
        GROUP BY l.accountId, c.accountCode, c.accountName, c.accountType
    """)
    List<Object[]> getTrialBalanceAccount(
            @Param("tenantId")      Long tenantId,
            @Param("associationId") Long associationId,
            @Param("accountId")     Long accountId,
            @Param("from")          LocalDate from,
            @Param("to")            LocalDate to,
            @Param("basis")         AccountingBasis basis
    );

    // ─────────────────────────────────────────────────────────────────────────
    //  Cash Flow Statement (all account types in one pass)
    // Returns: [ accountId, accountCode, accountName, accountType, SUM(debit), SUM(credit) ]
    // from and to are always non-null when this query is called.
    // ─────────────────────────────────────────────────────────────────────────

    @Query("""
        SELECT l.accountId,
               c.accountCode,
               c.accountName,
               c.accountType,
               COALESCE(SUM(l.debit), 0)  AS totalDebit,
               COALESCE(SUM(l.credit), 0) AS totalCredit
        FROM Ledger l
        JOIN Coa c ON c.id = l.accountId
        WHERE l.tenantId       = :tenantId
          AND c.isDeleted      = false
          AND l.date           BETWEEN :from AND :to
          AND l.associationId  = COALESCE(:associationId, l.associationId)
          AND l.accountingBasis = COALESCE(:basis, l.accountingBasis)
        GROUP BY l.accountId, c.accountCode, c.accountName, c.accountType
        ORDER BY c.accountCode
    """)
    List<Object[]> getAllAccountsForCashFlow(
            @Param("tenantId")      Long            tenantId,
            @Param("associationId") Long            associationId,
            @Param("from")          LocalDate       from,
            @Param("to")            LocalDate       to,
            @Param("basis")         AccountingBasis basis
    );

    // ─────────────────────────────────────────────────────────────────────────
    //  Cash Flow opening balance
    // Returns ASSETS account totals UP TO (exclusive) the period start.
    // openingCashBalance = sum of ASSETS (debit - credit) before from date.
    // Returns: [ accountId, SUM(debit), SUM(credit) ]
    // ─────────────────────────────────────────────────────────────────────────

    @Query("""
        SELECT l.accountId,
               COALESCE(SUM(l.debit), 0),
               COALESCE(SUM(l.credit), 0)
        FROM Ledger l
        JOIN Coa c ON c.id = l.accountId
        WHERE l.tenantId       = :tenantId
          AND c.accountType    = com.gstech.saas.accounting.coa.dto.AccountType.ASSETS
          AND c.isDeleted      = false
          AND l.date           < :from
          AND l.associationId  = COALESCE(:associationId, l.associationId)
        GROUP BY l.accountId
    """)
    List<Object[]> getAssetBalancesBeforeDate(
            @Param("tenantId")      Long      tenantId,
            @Param("associationId") Long      associationId,
            @Param("from")          LocalDate from
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Budget vs Actual actual amounts per account
    // Returns debit/credit per account for the given account IDs.
    // Used by BudgetVsActualService to look up actual spending per CoA account.
    // Returns: [ accountId, SUM(debit), SUM(credit) ]
    // ─────────────────────────────────────────────────────────────────────────

    @Query("""
        SELECT l.accountId,
               COALESCE(SUM(l.debit), 0),
               COALESCE(SUM(l.credit), 0)
        FROM Ledger l
        JOIN Coa c ON c.id = l.accountId
        WHERE l.tenantId       = :tenantId
          AND l.accountId      IN :accountIds
          AND c.isDeleted      = false
          AND l.date           BETWEEN :from AND :to
          AND l.associationId  = COALESCE(:associationId, l.associationId)
          AND l.accountingBasis = COALESCE(:basis, l.accountingBasis)
        GROUP BY l.accountId
    """)
    List<Object[]> getActualAmountsForAccounts(
            @Param("tenantId")      Long            tenantId,
            @Param("accountIds")    java.util.Collection<Long> accountIds,
            @Param("associationId") Long            associationId,
            @Param("from")          LocalDate       from,
            @Param("to")            LocalDate       to,
            @Param("basis")         AccountingBasis basis
    );
}