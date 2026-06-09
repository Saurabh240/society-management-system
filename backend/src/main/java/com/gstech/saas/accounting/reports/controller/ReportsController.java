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

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Financial Reports", description = "Balance sheet, income statement, and trial balance reporting endpoints")
public class ReportsController {

    private final ReportsService reportsService;

    @Operation(
            summary = "Generate Balance Sheet report",
            description = "Returns a snapshot of assets, liabilities, and equity as of the given date. " +
                    "Verifies the accounting equation: Total Assets = Total Liabilities + Total Equity. " +
                    "associationId is optional — omit to get report across all associations for the tenant. " +
                    "asOfDate defaults to today if not provided. " +
                    "accountingBasis defaults to ACCRUAL if not provided."
    )
    @GetMapping("/balance-sheet")
    public ResponseEntity<ApiResponse<BalanceSheetResponse>> getBalanceSheet(
            @Parameter(description = "Association ID (optional, null returns all associations)")
            @RequestParam(required = false) Long associationId,
            @Parameter(description = "As of date (ISO format, defaults to today)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate,
            @Parameter(description = "Accounting basis (CASH or ACCRUAL, defaults to ACCRUAL)",
                    schema = @Schema(allowableValues = {"CASH", "ACCRUAL"}))
            @RequestParam(required = false) AccountingBasis accountingBasis) {

        BalanceSheetResponse response = reportsService.generateBalanceSheet(associationId, asOfDate, accountingBasis);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
            summary = "Generate Income Statement report",
            description = "Returns revenue, expenses, and net income for a date range. " +
                    "Supports predefined date ranges (THIS_QUARTER, LAST_QUARTER, THIS_YEAR, LAST_YEAR) or custom from/to dates. " +
                    "associationId is optional — omit to get report across all associations. " +
                    "dateRange defaults to THIS_YEAR if not provided. " +
                    "accountingBasis defaults to ACCRUAL. " +
                    "accountSelection filters to INCOME_ONLY, EXPENSE_ONLY, or ALL (default ALL)."
    )
    @GetMapping("/income-statement")
    public ResponseEntity<ApiResponse<IncomeStatementResponse>> getIncomeStatement(
            @Parameter(description = "Association ID (optional, null returns all associations)")
            @RequestParam(required = false) Long associationId,
            @Parameter(description = "Predefined date range or CUSTOM for custom from/to dates",
                    schema = @Schema(allowableValues = {"THIS_QUARTER", "LAST_QUARTER", "THIS_YEAR", "LAST_YEAR", "CUSTOM"}))
            @RequestParam(required = false) DateRangeType dateRange,
            @Parameter(description = "Start date (ISO format, required if dateRange=CUSTOM)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "End date (ISO format, required if dateRange=CUSTOM)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @Parameter(description = "Accounting basis (CASH or ACCRUAL, defaults to ACCRUAL)",
                    schema = @Schema(allowableValues = {"CASH", "ACCRUAL"}))
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @Parameter(description = "Account selection filter (ALL, INCOME_ONLY, EXPENSE_ONLY)",
                    schema = @Schema(allowableValues = {"ALL", "INCOME_ONLY", "EXPENSE_ONLY"}))
            @RequestParam(required = false) AccountSelectionType accountSelection) {

        // Resolve date range
        LocalDate reportFrom = from;
        LocalDate reportTo = to;

        if (dateRange != null && dateRange != DateRangeType.CUSTOM) {
            LocalDate[] range = dateRange.getDateRange(null);
            reportFrom = range[0];
            reportTo = range[1];
        }

        IncomeStatementResponse response = reportsService.generateIncomeStatement(
                associationId, reportFrom, reportTo, accountingBasis, accountSelection);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
            summary = "Generate Trial Balance report",
            description = "Returns all accounts with total debits and credits for a date range. " +
                    "Validates data integrity: totalDebits should equal totalCredits. " +
                    "associationId is optional — omit to get report across all associations. " +
                    "dateRange defaults to THIS_YEAR if not provided. " +
                    "accountingBasis defaults to ACCRUAL. " +
                    "accountId filters to a specific account (optional)."
    )
    @GetMapping("/trial-balance")
    public ResponseEntity<ApiResponse<TrialBalanceResponse>> getTrialBalance(
            @Parameter(description = "Association ID (optional, null returns all associations)")
            @RequestParam(required = false) Long associationId,
            @Parameter(description = "Predefined date range or CUSTOM for custom from/to dates",
                    schema = @Schema(allowableValues = {"THIS_QUARTER", "LAST_QUARTER", "THIS_YEAR", "LAST_YEAR", "CUSTOM"}))
            @RequestParam(required = false) DateRangeType dateRange,
            @Parameter(description = "Start date (ISO format, required if dateRange=CUSTOM)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "End date (ISO format, required if dateRange=CUSTOM)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @Parameter(description = "Accounting basis (CASH or ACCRUAL, defaults to ACCRUAL)",
                    schema = @Schema(allowableValues = {"CASH", "ACCRUAL"}))
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @Parameter(description = "Filter to a specific account ID (optional)")
            @RequestParam(required = false) Long accountId) {

        // Resolve date range
        LocalDate reportFrom = from;
        LocalDate reportTo = to;

        if (dateRange != null && dateRange != DateRangeType.CUSTOM) {
            LocalDate[] range = dateRange.getDateRange(null);
            reportFrom = range[0];
            reportTo = range[1];
        }

        TrialBalanceResponse response = reportsService.generateTrialBalance(
                associationId, reportFrom, reportTo, accountingBasis, accountId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}