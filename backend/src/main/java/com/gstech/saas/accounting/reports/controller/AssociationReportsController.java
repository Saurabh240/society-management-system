package com.gstech.saas.accounting.reports.controller;

import com.gstech.saas.accounting.reports.dto.*;
import com.gstech.saas.accounting.reports.service.AssociationReportsService;
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
@Tag(name = "Association Reports", description = "Vendor spending, assessment history and owner statement reports")
public class AssociationReportsController {

    private final AssociationReportsService reportsService;

    @Operation(
            summary = "Vendor Spending Report",
            description = "Groups bills by vendor with totals for billed, paid and outstanding amounts. " +
                    "Filter by association and date range."
    )
    @GetMapping("/vendor-spending")
    public ResponseEntity<ApiResponse<VendorSpendingResponse>> getVendorSpending(
            @RequestParam(name = "associationId", required = false) Long associationId,
            @RequestParam(name = "from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.getVendorSpending(associationId, from, to)));
    }

    @GetMapping("/assessment-history")
    public ResponseEntity<ApiResponse<AssessmentHistoryResponse>> getAssessmentHistory(
            @RequestParam(name = "associationId", required = false) Long associationId,
            @RequestParam(name = "from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.getAssessmentHistory(associationId, from, to)));
    }

    @Operation(
            summary = "Unit Owner Statement",
            description = "Full transaction statement for a specific unit and owner showing charges, " +
                    "payments, opening/closing balance. Both associationId and unitId are required."
    )
    @GetMapping("/unit-owner-statement")
    public ResponseEntity<ApiResponse<UnitOwnerStatementResponse>> getUnitOwnerStatement(
            @RequestParam(name = "associationId") Long associationId,
            @RequestParam(name = "unitId")        Long unitId,
            @RequestParam(name = "from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.getUnitOwnerStatement(associationId, unitId, from, to)));
    }

    @Operation(
            summary = "Financial Summary Report",
            description = "Comprehensive financial overview including revenue, expenses, net income, " +
                    "assets, liabilities, equity, and collection metrics for a date range."
    )
    @GetMapping("/financial-summary")
    public ResponseEntity<ApiResponse<FinancialSummaryResponse>> getFinancialSummary(
            @RequestParam(name = "associationId", required = false) Long associationId,
            @RequestParam(name = "from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.getFinancialSummary(associationId, from, to)));
    }

    @Operation(
            summary = "Unit Occupancy Report",
            description = "Current occupancy status of all units including occupied count, " +
                    "vacant count, and occupancy rate percentage."
    )
    @GetMapping("/unit-occupancy")
    public ResponseEntity<ApiResponse<UnitOccupancyResponse>> getUnitOccupancy(
            @RequestParam(name = "associationId", required = false) Long associationId,
            @RequestParam(name = "dateRange", required = false, defaultValue = "CURRENT") String dateRange) {

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.getUnitOccupancy(associationId)));
    }

    @Operation(
            summary = "Delinquency Report",
            description = "Unpaid invoices and outstanding charges grouped by aging bucket (0-30, 31-60, 61-90, 90+ days)."
    )
    @GetMapping("/delinquency")
    public ResponseEntity<ApiResponse<DelinquencyResponse>> getDelinquency(
            @RequestParam(name = "associationId", required = false) Long associationId,
            @RequestParam(name = "agingPeriod", required = false, defaultValue = "ALL") String agingPeriod) {

        return ResponseEntity.ok(ApiResponse.success(
                reportsService.getDelinquency(associationId, agingPeriod)));
    }
}