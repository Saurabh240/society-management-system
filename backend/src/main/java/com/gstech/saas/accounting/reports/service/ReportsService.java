package com.gstech.saas.accounting.reports.service;

import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.reports.dto.*;
import com.gstech.saas.accounting.reports.repository.ReportsRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportsService {

    private final ReportsRepository reportsRepository;

    /**
     * Generate Balance Sheet as of a specific date
     * Defaults to today if asOfDate is null
     * Supports CASH and ACCRUAL accounting basis
     */
    public BalanceSheetResponse generateBalanceSheet(
            Long associationId,
            LocalDate asOfDate,
            AccountingBasis basis) {

        Long tenantId = TenantContext.get();
        LocalDate reportDate = asOfDate != null ? asOfDate : LocalDate.now();
        AccountingBasis reportBasis = basis != null ? basis : AccountingBasis.ACCRUAL;

        List<ReportLineItem> assets      = fetchLineItems(tenantId, associationId, reportDate, AccountType.ASSETS,      true, reportBasis);
        List<ReportLineItem> liabilities = fetchLineItems(tenantId, associationId, reportDate, AccountType.LIABILITIES, false, reportBasis);
        List<ReportLineItem> equity      = fetchLineItems(tenantId, associationId, reportDate, AccountType.EQUITY,      false, reportBasis);

        BigDecimal totalAssets      = sumBalances(assets);
        BigDecimal totalLiabilities = sumBalances(liabilities);
        BigDecimal totalEquity      = sumBalances(equity);

        BigDecimal liabilitiesPlusEquity = totalLiabilities.add(totalEquity);
        boolean isBalanced = totalAssets.compareTo(liabilitiesPlusEquity) == 0;

        if (!isBalanced) {
            log.warn("Balance sheet is NOT balanced for tenantId={}, associationId={}, asOfDate={}. " +
                    "Assets={}, Liabilities+Equity={}", tenantId, associationId, reportDate, totalAssets, liabilitiesPlusEquity);
        }

        return new BalanceSheetResponse(
                reportDate,
                reportBasis.name(),
                assets,
                liabilities,
                equity,
                totalAssets,
                totalLiabilities,
                totalEquity,
                isBalanced
        );
    }

    /**
     * Generate Income Statement for a date range
     * Supports CASH and ACCRUAL accounting basis
     * Supports filtering: ALL, INCOME_ONLY, EXPENSE_ONLY
     */
    public IncomeStatementResponse generateIncomeStatement(
            Long associationId,
            LocalDate from,
            LocalDate to,
            AccountingBasis basis,
            AccountSelectionType selection) {

        Long tenantId = TenantContext.get();
        LocalDate reportFrom = from != null ? from : LocalDate.now().withDayOfYear(1);
        LocalDate reportTo = to != null ? to : LocalDate.now();
        AccountingBasis reportBasis = basis != null ? basis : AccountingBasis.ACCRUAL;
        AccountSelectionType reportSelection = selection != null ? selection : AccountSelectionType.ALL;

        List<ReportLineItem> revenue = List.of();
        List<ReportLineItem> expenses = List.of();

        // Fetch revenue (INCOME accounts)
        if (reportSelection == AccountSelectionType.ALL || reportSelection == AccountSelectionType.INCOME_ONLY) {
            revenue = fetchIncomeStatementLineItems(tenantId, associationId, reportFrom, reportTo, AccountType.INCOME, true, reportBasis);
        }

        // Fetch expenses (EXPENSE accounts)
        if (reportSelection == AccountSelectionType.ALL || reportSelection == AccountSelectionType.EXPENSE_ONLY) {
            expenses = fetchIncomeStatementLineItems(tenantId, associationId, reportFrom, reportTo, AccountType.EXPENSES, false, reportBasis);
        }

        BigDecimal totalRevenue = sumBalances(revenue);
        BigDecimal totalExpenses = sumBalances(expenses);
        BigDecimal netIncome = totalRevenue.subtract(totalExpenses);

        return new IncomeStatementResponse(
                reportFrom,
                reportTo,
                reportBasis.name(),
                totalRevenue,
                totalExpenses,
                netIncome,
                revenue,
                expenses
        );
    }

    /**
     * Generate Trial Balance for a date range
     * Validates data integrity: totalDebits == totalCredits
     * Supports CASH and ACCRUAL accounting basis
     * Can filter by specific accountId
     */
    public TrialBalanceResponse generateTrialBalance(
            Long associationId,
            LocalDate from,
            LocalDate to,
            AccountingBasis basis,
            Long accountId) {

        Long tenantId = TenantContext.get();
        LocalDate reportFrom = from != null ? from : LocalDate.now().withDayOfYear(1);
        LocalDate reportTo = to != null ? to : LocalDate.now();
        AccountingBasis reportBasis = basis != null ? basis : AccountingBasis.ACCRUAL;

        List<TrialBalanceRow> accounts;

        if (accountId != null) {
            // Fetch specific account
            accounts = reportsRepository
                    .getTrialBalanceAccount(tenantId, associationId, accountId, reportFrom, reportTo, reportBasis)
                    .stream()
                    .map(this::mapToTrialBalanceRow)
                    .toList();
        } else {
            // Fetch all accounts
            accounts = reportsRepository
                    .getTrialBalanceAccounts(tenantId, associationId, reportFrom, reportTo, reportBasis)
                    .stream()
                    .map(this::mapToTrialBalanceRow)
                    .toList();
        }

        BigDecimal totalDebits = accounts.stream()
                .map(TrialBalanceRow::totalDebit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCredits = accounts.stream()
                .map(TrialBalanceRow::totalCredit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        boolean isBalanced = totalDebits.compareTo(totalCredits) == 0;

        if (!isBalanced) {
            log.warn("Trial balance is NOT balanced for tenantId={}, associationId={}, from={}, to={}. " +
                    "TotalDebits={}, TotalCredits={}", tenantId, associationId, reportFrom, reportTo, totalDebits, totalCredits);
        }

        return new TrialBalanceResponse(
                reportFrom,
                reportTo,
                reportBasis.name(),
                totalDebits,
                totalCredits,
                isBalanced,
                accounts
        );
    }

    /**
     * Fetch ledger rows for one account type (Balance Sheet)
     *
     * @param debitNormal true  → balance = debits - credits  (ASSETS, EXPENSES)
     *                    false → balance = credits - debits  (LIABILITIES, EQUITY, INCOME)
     */
    private List<ReportLineItem> fetchLineItems(
            Long tenantId,
            Long associationId,
            LocalDate asOfDate,
            AccountType accountType,
            boolean debitNormal,
            AccountingBasis basis) {

        return reportsRepository
                .getAccountBalances(tenantId, accountType, associationId, asOfDate, basis)
                .stream()
                .map(row -> {
                    String      accountCode  = (String)     row[1];
                    String      accountName  = (String)     row[2];
                    BigDecimal  totalDebit   = (BigDecimal) row[3];
                    BigDecimal  totalCredit  = (BigDecimal) row[4];

                    BigDecimal balance = debitNormal
                            ? totalDebit.subtract(totalCredit)   // ASSETS/EXPENSES: DR - CR
                            : totalCredit.subtract(totalDebit);  // LIABILITIES/EQUITY/INCOME: CR - DR

                    return new ReportLineItem(accountCode, accountName, balance);
                })
                .filter(item -> item.balance().compareTo(BigDecimal.ZERO) != 0) // skip zero-balance accounts
                .toList();
    }

    /**
     * Fetch ledger rows for Income Statement accounts
     *
     * @param debitNormal true  → balance = debits - credits  (EXPENSES)
     *                    false → balance = credits - debits  (INCOME)
     */
    private List<ReportLineItem> fetchIncomeStatementLineItems(
            Long tenantId,
            Long associationId,
            LocalDate from,
            LocalDate to,
            AccountType accountType,
            boolean debitNormal,
            AccountingBasis basis) {

        return reportsRepository
                .getIncomeStatementAccounts(tenantId, accountType, associationId, from, to, basis)
                .stream()
                .map(row -> {
                    String      accountCode  = (String)     row[1];
                    String      accountName  = (String)     row[2];
                    BigDecimal  totalDebit   = (BigDecimal) row[3];
                    BigDecimal  totalCredit  = (BigDecimal) row[4];

                    BigDecimal balance = debitNormal
                            ? totalDebit.subtract(totalCredit)   // EXPENSES: DR - CR
                            : totalCredit.subtract(totalDebit);  // INCOME: CR - DR

                    return new ReportLineItem(accountCode, accountName, balance);
                })
                .filter(item -> item.balance().compareTo(BigDecimal.ZERO) != 0) // skip zero-balance accounts
                .toList();
    }

    /**
     * Map database row to TrialBalanceRow DTO
     */
    private TrialBalanceRow mapToTrialBalanceRow(Object[] row) {
        String      accountCode  = (String)     row[1];
        String      accountName  = (String)     row[2];
        String      accountType  = ((AccountType) row[3]).name();
        BigDecimal  totalDebit   = (BigDecimal) row[4];
        BigDecimal  totalCredit  = (BigDecimal) row[5];

        // Balance calculation: debit-normal for ASSETS/EXPENSES, credit-normal for others
        AccountType type = AccountType.valueOf(accountType);
        BigDecimal balance = (type == AccountType.ASSETS || type == AccountType.EXPENSES)
                ? totalDebit.subtract(totalCredit)
                : totalCredit.subtract(totalDebit);

        return new TrialBalanceRow(accountCode, accountName, accountType, totalDebit, totalCredit, balance);
    }

    private BigDecimal sumBalances(List<ReportLineItem> items) {
        return items.stream()
                .map(ReportLineItem::balance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}