package com.gstech.saas.accounting.reports.controller;

import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.reports.dto.*;
import com.gstech.saas.accounting.reports.service.ReportsService;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Financial Reports controller.
 */
@RestController
@RequestMapping("/api/v1/reports/financial")
@RequiredArgsConstructor
@Tag(name = "Financial Reports",
        description = "Balance sheet, income statement, trial balance, cash flow, " +
                "vendor ledger, and budget vs actual reporting endpoints")
public class FinancialReportsController {

    private final ReportsService reportsService;

    @Operation(
            summary = "Generate Balance Sheet report",
            description = "Snapshot of assets, liabilities, and equity as of the given date. " +
                    "Verifies the accounting equation: Total Assets = Total Liabilities + Total Equity. " +
                    "associationId is optional — omit for all associations. " +
                    "asOfDate defaults to today. accountingBasis defaults to ACCRUAL."
    )
    @GetMapping("/balance-sheet")
    public ResponseEntity<ApiResponse<BalanceSheetResponse>> getBalanceSheet(
            @Parameter(description = "Association ID (optional)")
            @RequestParam(required = false) Long associationId,
            @Parameter(description = "As of date (ISO format, defaults to today)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate,
            @Parameter(description = "Accounting basis", schema = @Schema(allowableValues = {"CASH", "ACCRUAL"}))
            @RequestParam(required = false) AccountingBasis accountingBasis) {

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.generateBalanceSheet(associationId, asOfDate, accountingBasis)));
    }

    @Operation(
            summary = "Generate Income Statement report",
            description = "Revenue, expenses, and net income for a date range. " +
                    "dateRange preset: THIS_QUARTER | LAST_QUARTER | THIS_YEAR | LAST_YEAR | CUSTOM. " +
                    "When CUSTOM, provide from and to. accountSelection: ALL | INCOME_ONLY | EXPENSE_ONLY."
    )
    @GetMapping("/income-statement")
    public ResponseEntity<ApiResponse<IncomeStatementResponse>> getIncomeStatement(
            @RequestParam(required = false) Long associationId,
            @Parameter(schema = @Schema(allowableValues = {"THIS_QUARTER", "LAST_QUARTER", "THIS_YEAR", "LAST_YEAR", "CUSTOM"}))
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @Parameter(schema = @Schema(allowableValues = {"CASH", "ACCRUAL"}))
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @Parameter(schema = @Schema(allowableValues = {"ALL", "INCOME_ONLY", "EXPENSE_ONLY"}))
            @RequestParam(required = false) AccountSelectionType accountSelection) {

        LocalDate reportFrom = from;
        LocalDate reportTo   = to;
        if (dateRange != null && dateRange != DateRangeType.CUSTOM) {
            LocalDate[] range = dateRange.getDateRange(null);
            reportFrom = range[0];
            reportTo   = range[1];
        }

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.generateIncomeStatement(
                        associationId, reportFrom, reportTo, accountingBasis, accountSelection)));
    }

    @Operation(
            summary = "Generate Trial Balance report",
            description = "All accounts with total debits and credits. " +
                    "isBalanced=true confirms data integrity. " +
                    "accountId (optional) filters to a single account."
    )
    @GetMapping("/trial-balance")
    public ResponseEntity<ApiResponse<TrialBalanceResponse>> getTrialBalance(
            @RequestParam(required = false) Long associationId,
            @Parameter(schema = @Schema(allowableValues = {"THIS_QUARTER", "LAST_QUARTER", "THIS_YEAR", "LAST_YEAR", "CUSTOM"}))
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @Parameter(schema = @Schema(allowableValues = {"CASH", "ACCRUAL"}))
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @RequestParam(required = false) Long accountId) {

        LocalDate reportFrom = from;
        LocalDate reportTo   = to;
        if (dateRange != null && dateRange != DateRangeType.CUSTOM) {
            LocalDate[] range = dateRange.getDateRange(null);
            reportFrom = range[0];
            reportTo   = range[1];
        }

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.generateTrialBalance(
                        associationId, reportFrom, reportTo, accountingBasis, accountId)));
    }

    @Operation(
            summary = "Generate Cash Flow Statement",
            description = "Shows how cash moved through Operating, Investing, and Financing activities. " +
                    "Operating: INCOME and EXPENSES accounts. " +
                    "Investing: ASSETS accounts. " +
                    "Financing: LIABILITIES and EQUITY accounts. " +
                    "Opening and closing cash balance computed from ASSETS accounts."
    )
    @GetMapping("/cash-flow")
    public ResponseEntity<ApiResponse<CashFlowResponse>> getCashFlow(
            @RequestParam(required = false) Long associationId,
            @Parameter(schema = @Schema(allowableValues = {"THIS_QUARTER", "LAST_QUARTER", "THIS_YEAR", "LAST_YEAR", "CUSTOM"}))
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @Parameter(schema = @Schema(allowableValues = {"CASH", "ACCRUAL"}))
            @RequestParam(required = false) AccountingBasis accountingBasis) {

        LocalDate reportFrom = from;
        LocalDate reportTo   = to;
        if (dateRange != null && dateRange != DateRangeType.CUSTOM) {
            LocalDate[] range = dateRange.getDateRange(null);
            reportFrom = range[0];
            reportTo   = range[1];
        }

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.generateCashFlow(associationId, reportFrom, reportTo, accountingBasis)));
    }

    @Operation(
            summary = "Generate Vendor Ledger Report",
            description = "Transaction history per vendor — all bills with running balance. " +
                    "vendorId (optional): filter to a single vendor. " +
                    "associationId (optional): filter to a single association. " +
                    "Vendor name always uses companyName field."
    )
    @GetMapping("/vendor-ledger")
    public ResponseEntity<ApiResponse<VendorLedgerResponse>> getVendorLedger(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) Long vendorId,
            @Parameter(schema = @Schema(allowableValues = {"THIS_QUARTER", "LAST_QUARTER", "THIS_YEAR", "LAST_YEAR", "CUSTOM"}))
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        LocalDate reportFrom = from;
        LocalDate reportTo   = to;
        if (dateRange != null && dateRange != DateRangeType.CUSTOM) {
            LocalDate[] range = dateRange.getDateRange(null);
            reportFrom = range[0];
            reportTo   = range[1];
        }

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.generateVendorLedger(associationId, vendorId, reportFrom, reportTo)));
    }

    @Operation(
            summary = "Generate Budget vs Actual Report",
            description = "Compares budgeted amounts against actual ledger entries. " +
                    "budgetId is REQUIRED — returns 400 if missing. " +
                    "Positive variance on INCOME = actual exceeded budget (good). " +
                    "Positive variance on EXPENSES = under budget (good). " +
                    "If no date range supplied, uses the budget's own startDate–endDate period."
    )
    @GetMapping("/budget-vs-actual")
    public ResponseEntity<ApiResponse<BudgetVsActualResponse>> getBudgetVsActual(
            @Parameter(description = "Budget ID (required)", required = true)
            @RequestParam Long budgetId,
            @Parameter(schema = @Schema(allowableValues = {"CASH", "ACCRUAL"}))
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @Parameter(schema = @Schema(allowableValues = {"THIS_QUARTER", "LAST_QUARTER", "THIS_YEAR", "LAST_YEAR", "CUSTOM"}))
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        LocalDate reportFrom = from;
        LocalDate reportTo   = to;
        if (dateRange != null && dateRange != DateRangeType.CUSTOM) {
            LocalDate[] range = dateRange.getDateRange(null);
            reportFrom = range[0];
            reportTo   = range[1];
        }

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.generateBudgetVsActual(budgetId, accountingBasis, reportFrom, reportTo)));
    }
}