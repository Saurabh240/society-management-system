package com.gstech.saas.accounting.reports.controller;

import com.gstech.saas.accounting.reports.dto.BalanceSheetResponse;
import com.gstech.saas.accounting.reports.service.ReportsService;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports/association")
@RequiredArgsConstructor
@Tag(name = "Financial Reports", description = "Balance sheet and financial reporting endpoints")
public class ReportsController {

    private final ReportsService reportsService;

    @Operation(
            summary = "Generate Balance Sheet report",
            description = "Returns a snapshot of assets, liabilities, and equity as of the given date. " +
                    "Verifies the accounting equation: Total Assets = Total Liabilities + Total Equity. " +
                    "associationId is optional — omit to get report across all associations for the tenant."
    )
    @GetMapping("/balance-sheet")
    public ResponseEntity<ApiResponse<BalanceSheetResponse>> getBalanceSheet(
            @RequestParam(name = "associationId") Long associationId,
            @RequestParam(name = "asOfDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {

        return ResponseEntity.ok(
                ApiResponse.success(reportsService.generateBalanceSheet(associationId, asOfDate))
        );
    }
}