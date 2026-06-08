package com.gstech.saas.accounting.reports.repository;

import com.gstech.saas.accounting.coa.dto.AccountType;
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
     * Uses COALESCE to avoid IS NULL OR PostgreSQL type error.
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
        GROUP BY l.accountId, c.accountCode, c.accountName
        ORDER BY c.accountCode
    """)
    List<Object[]> getAccountBalances(
            @Param("tenantId")      Long tenantId,
            @Param("accountType")   AccountType accountType,
            @Param("associationId") Long associationId,
            @Param("asOfDate")      LocalDate asOfDate
    );
}