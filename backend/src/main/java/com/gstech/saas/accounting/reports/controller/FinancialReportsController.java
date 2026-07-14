package com.gstech.saas.accounting.reports.controller;

import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.reports.dto.*;
import com.gstech.saas.accounting.reports.service.FinancialReportsService;
import com.gstech.saas.accounting.reports.service.ReportExportService;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    private final FinancialReportsService financialReportsService;
    private final ReportExportService exportService;

    // ════════════════════════════════════════════════════════════════════════
    // BALANCE SHEET
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/balance-sheet")
    public ResponseEntity<ApiResponse<BalanceSheetResponse>> getBalanceSheet(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate,
            @RequestParam(required = false) AccountingBasis accountingBasis) {
        return ResponseEntity.ok(ApiResponse.success(
                financialReportsService.generateBalanceSheet(associationId, asOfDate, accountingBasis)));
    }

    @GetMapping("/balance-sheet/export/pdf")
    public ResponseEntity<byte[]> balanceSheetPdf(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate,
            @RequestParam(required = false) AccountingBasis accountingBasis) {
        BalanceSheetResponse report = financialReportsService.generateBalanceSheet(associationId, asOfDate, accountingBasis);
        String assocLabel = associationId != null ? "Association-" + associationId : "All-Associations";
        byte[] pdf = exportService.balanceSheetPdf(report, assocLabel.replace("-", " "));
        String filename = "Balance-Sheet-" + assocLabel + "-" + (asOfDate != null ? asOfDate : LocalDate.now()) + ".pdf";
        return buildPdfResponse(pdf, filename);
    }

    @GetMapping("/balance-sheet/export/csv")
    public ResponseEntity<byte[]> balanceSheetCsv(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate,
            @RequestParam(required = false) AccountingBasis accountingBasis) {
        BalanceSheetResponse report = financialReportsService.generateBalanceSheet(associationId, asOfDate, accountingBasis);
        String assocLabel = associationId != null ? "Association-" + associationId : "All-Associations";
        String csv = exportService.balanceSheetCsv(report, assocLabel.replace("-", " "));
        String filename = "Balance-Sheet-" + assocLabel + "-" + (asOfDate != null ? asOfDate : LocalDate.now()) + ".csv";
        return buildCsvResponse(csv, filename);
    }

    // ════════════════════════════════════════════════════════════════════════
    // INCOME STATEMENT
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/income-statement")
    public ResponseEntity<ApiResponse<IncomeStatementResponse>> getIncomeStatement(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @RequestParam(required = false) AccountSelectionType accountSelection) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        return ResponseEntity.ok(ApiResponse.success(
                financialReportsService.generateIncomeStatement(associationId, range[0], range[1], accountingBasis, accountSelection)));
    }

    @GetMapping("/income-statement/export/pdf")
    public ResponseEntity<byte[]> incomeStatementPdf(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @RequestParam(required = false) AccountSelectionType accountSelection) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        IncomeStatementResponse report = financialReportsService.generateIncomeStatement(associationId, range[0], range[1], accountingBasis, accountSelection);
        String assocLabel = associationId != null ? "Association-" + associationId : "All-Associations";
        byte[] pdf = exportService.incomeStatementPdf(report, assocLabel.replace("-", " "));
        return buildPdfResponse(pdf, "Income-Statement-" + assocLabel + "-" + range[0] + "-to-" + range[1] + ".pdf");
    }

    @GetMapping("/income-statement/export/csv")
    public ResponseEntity<byte[]> incomeStatementCsv(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @RequestParam(required = false) AccountSelectionType accountSelection) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        IncomeStatementResponse report = financialReportsService.generateIncomeStatement(associationId, range[0], range[1], accountingBasis, accountSelection);
        String assocLabel = associationId != null ? "Association-" + associationId : "All-Associations";
        String csv = exportService.incomeStatementCsv(report, assocLabel.replace("-", " "));
        return buildCsvResponse(csv, "Income-Statement-" + assocLabel + "-" + range[0] + "-to-" + range[1] + ".csv");
    }

    // ════════════════════════════════════════════════════════════════════════
    // TRIAL BALANCE
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/trial-balance")
    public ResponseEntity<ApiResponse<TrialBalanceResponse>> getTrialBalance(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @RequestParam(required = false) Long accountId) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        return ResponseEntity.ok(ApiResponse.success(
                financialReportsService.generateTrialBalance(associationId, range[0], range[1], accountingBasis, accountId)));
    }

    @GetMapping("/trial-balance/export/pdf")
    public ResponseEntity<byte[]> trialBalancePdf(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @RequestParam(required = false) Long accountId) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        TrialBalanceResponse report = financialReportsService.generateTrialBalance(associationId, range[0], range[1], accountingBasis, accountId);
        String assocLabel = associationId != null ? "Association-" + associationId : "All-Associations";
        byte[] pdf = exportService.trialBalancePdf(report, assocLabel.replace("-", " "));
        return buildPdfResponse(pdf, "Trial-Balance-" + assocLabel + "-" + range[0] + "-to-" + range[1] + ".pdf");
    }

    @GetMapping("/trial-balance/export/csv")
    public ResponseEntity<byte[]> trialBalanceCsv(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @RequestParam(required = false) Long accountId) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        TrialBalanceResponse report = financialReportsService.generateTrialBalance(associationId, range[0], range[1], accountingBasis, accountId);
        String assocLabel = associationId != null ? "Association-" + associationId : "All-Associations";
        String csv = exportService.trialBalanceCsv(report, assocLabel.replace("-", " "));
        return buildCsvResponse(csv, "Trial-Balance-" + assocLabel + "-" + range[0] + "-to-" + range[1] + ".csv");
    }

    // ════════════════════════════════════════════════════════════════════════
    // CASH FLOW
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/cash-flow")
    public ResponseEntity<ApiResponse<CashFlowResponse>> getCashFlow(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AccountingBasis accountingBasis) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        return ResponseEntity.ok(ApiResponse.success(
                financialReportsService.generateCashFlow(associationId, range[0], range[1], accountingBasis)));
    }

    @GetMapping("/cash-flow/export/pdf")
    public ResponseEntity<byte[]> cashFlowPdf(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AccountingBasis accountingBasis) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        CashFlowResponse report = financialReportsService.generateCashFlow(associationId, range[0], range[1], accountingBasis);
        String assocLabel = associationId != null ? "Association-" + associationId : "All-Associations";
        byte[] pdf = exportService.cashFlowPdf(report, assocLabel.replace("-", " "));
        return buildPdfResponse(pdf, "Cash-Flow-Statement-" + assocLabel + "-" + range[0] + "-to-" + range[1] + ".pdf");
    }

    @GetMapping("/cash-flow/export/csv")
    public ResponseEntity<byte[]> cashFlowCsv(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AccountingBasis accountingBasis) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        CashFlowResponse report = financialReportsService.generateCashFlow(associationId, range[0], range[1], accountingBasis);
        String assocLabel = associationId != null ? "Association-" + associationId : "All-Associations";
        String csv = exportService.cashFlowCsv(report, assocLabel.replace("-", " "));
        return buildCsvResponse(csv, "Cash-Flow-Statement-" + assocLabel + "-" + range[0] + "-to-" + range[1] + ".csv");
    }

    // ════════════════════════════════════════════════════════════════════════
    // VENDOR LEDGER
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/vendor-ledger")
    public ResponseEntity<ApiResponse<VendorLedgerResponse>> getVendorLedger(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        return ResponseEntity.ok(ApiResponse.success(
                financialReportsService.generateVendorLedger(associationId, vendorId, range[0], range[1])));
    }

    @GetMapping("/vendor-ledger/export/pdf")
    public ResponseEntity<byte[]> vendorLedgerPdf(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        VendorLedgerResponse report = financialReportsService.generateVendorLedger(associationId, vendorId, range[0], range[1]);
        String assocLabel = associationId != null ? "Association-" + associationId : "All-Associations";
        byte[] pdf = exportService.vendorLedgerPdf(report, assocLabel.replace("-", " "));
        return buildPdfResponse(pdf, "Vendor-Ledger-" + assocLabel + "-" + range[0] + "-to-" + range[1] + ".pdf");
    }

    @GetMapping("/vendor-ledger/export/csv")
    public ResponseEntity<byte[]> vendorLedgerCsv(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        VendorLedgerResponse report = financialReportsService.generateVendorLedger(associationId, vendorId, range[0], range[1]);
        String assocLabel = associationId != null ? "Association-" + associationId : "All-Associations";
        String csv = exportService.vendorLedgerCsv(report);
        return buildCsvResponse(csv, "Vendor-Ledger-" + assocLabel + "-" + range[0] + "-to-" + range[1] + ".csv");
    }

    // ════════════════════════════════════════════════════════════════════════
    // BUDGET VS ACTUAL
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/budget-vs-actual")
    public ResponseEntity<ApiResponse<BudgetVsActualResponse>> getBudgetVsActual(
            @RequestParam Long budgetId,
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        return ResponseEntity.ok(ApiResponse.success(
                financialReportsService.generateBudgetVsActual(budgetId, accountingBasis, range[0], range[1])));
    }

    @GetMapping("/budget-vs-actual/export/pdf")
    public ResponseEntity<byte[]> budgetVsActualPdf(
            @RequestParam Long budgetId,
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        BudgetVsActualResponse report = financialReportsService.generateBudgetVsActual(budgetId, accountingBasis, range[0], range[1]);
        byte[] pdf = exportService.budgetVsActualPdf(report, "All Associations");
        return buildPdfResponse(pdf, "Budget-vs-Actual-All-Associations-" + range[0] + "-to-" + range[1] + ".pdf");
    }

    @GetMapping("/budget-vs-actual/export/csv")
    public ResponseEntity<byte[]> budgetVsActualCsv(
            @RequestParam Long budgetId,
            @RequestParam(required = false) AccountingBasis accountingBasis,
            @RequestParam(required = false) DateRangeType dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate[] range = resolveRange(dateRange, from, to);
        BudgetVsActualResponse report = financialReportsService.generateBudgetVsActual(budgetId, accountingBasis, range[0], range[1]);
        String csv = exportService.budgetVsActualCsv(report, "All Associations");
        return buildCsvResponse(csv, "Budget-vs-Actual-All-Associations-" + range[0] + "-to-" + range[1] + ".csv");
    }

    // ════════════════════════════════════════════════════════════════════════
    // SHARED HELPERS
    // ════════════════════════════════════════════════════════════════════════

    private LocalDate[] resolveRange(DateRangeType dateRange, LocalDate from, LocalDate to) {
        LocalDate resolvedFrom = from;
        LocalDate resolvedTo   = to;
        if (dateRange != null && dateRange != DateRangeType.CUSTOM) {
            LocalDate[] range = dateRange.getDateRange(null);
            resolvedFrom = range[0];
            resolvedTo   = range[1];
        }
        return new LocalDate[]{ resolvedFrom, resolvedTo };
    }

    private ResponseEntity<byte[]> buildPdfResponse(byte[] data, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
        headers.setContentLength(data.length);
        return ResponseEntity.ok().headers(headers).body(data);
    }

    private ResponseEntity<byte[]> buildCsvResponse(String csv, String filename) {
        byte[] data = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
        headers.setContentLength(data.length);
        return ResponseEntity.ok().headers(headers).body(data);
    }
}