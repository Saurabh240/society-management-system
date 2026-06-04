package com.gstech.saas.accounting.reports.controller;

import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.reports.dto.AccountSelection;
import com.gstech.saas.accounting.reports.dto.BalanceSheetResponse;
import com.gstech.saas.accounting.reports.dto.IncomeStatementResponse;
import com.gstech.saas.accounting.reports.dto.ReportDateRange;
import com.gstech.saas.accounting.reports.dto.TrialBalanceResponse;
import com.gstech.saas.accounting.reports.service.ReportsService;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Financial Reports")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/balance-sheet")
    @Operation(summary = "Balance Sheet Report")
    public ResponseEntity<ApiResponse<BalanceSheetResponse>> balanceSheet(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) LocalDate asOfDate,
            @RequestParam(defaultValue = "ACCRUAL")
            AccountingBasis accountingBasis
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        reportsService.getBalanceSheet(
                                associationId,
                                asOfDate,
                                accountingBasis
                        )
                )
        );
    }

    @GetMapping("/trial-balance")
    @Operation(summary = "Trial Balance Report")
    public ResponseEntity<ApiResponse<TrialBalanceResponse>> trialBalance(
            @RequestParam(required = false) Long associationId,
            @RequestParam(defaultValue = "CUSTOM") ReportDateRange dateRange,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "ACCRUAL")
            AccountingBasis accountingBasis,
            @RequestParam(defaultValue = "ALL")
            AccountSelection accountSelection
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        reportsService.getTrialBalance(
                                associationId,
                                dateRange,
                                from,
                                to,
                                accountingBasis,
                                accountSelection
                        )
                )
        );
    }

    @GetMapping("/income-statement")
    @Operation(summary = "Income Statement Report")
    public ResponseEntity<ApiResponse<IncomeStatementResponse>> incomeStatement(
            @RequestParam(required = false) Long associationId,
            @RequestParam(defaultValue = "CUSTOM") ReportDateRange dateRange,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "ACCRUAL")
            AccountingBasis accountingBasis,
            @RequestParam(defaultValue = "ALL")
            AccountSelection accountSelection
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        reportsService.getIncomeStatement(
                                associationId,
                                dateRange,
                                from,
                                to,
                                accountingBasis,
                                accountSelection
                        )
                )
        );
    }
}