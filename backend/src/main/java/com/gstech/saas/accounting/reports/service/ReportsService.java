package com.gstech.saas.accounting.reports.service;

import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.reports.dto.*;

import java.time.LocalDate;

public interface ReportsService {

    BalanceSheetResponse getBalanceSheet(
            Long associationId,
            LocalDate asOfDate,
            AccountingBasis basis
    );

    IncomeStatementResponse getIncomeStatement(
            Long associationId,
            ReportDateRange dateRange,
            LocalDate from,
            LocalDate to,
            AccountingBasis basis,
            AccountSelection selection
    );

    TrialBalanceResponse getTrialBalance(
            Long associationId,
            ReportDateRange dateRange,
            LocalDate from,
            LocalDate to,
            AccountingBasis basis,
            AccountSelection selection

    );

    VendorLedgerResponse getVendorLedger(
            Long associationId,
            Long vendorId,
            ReportDateRange dateRange,
            LocalDate from,
            LocalDate to
    );

    BudgetVsActualResponse getBudgetVsActual(
            Long budgetId,
            Long associationId,
            AccountingBasis accountingBasis,
            ReportDateRange dateRange,
            LocalDate from,
            LocalDate to
    );
}