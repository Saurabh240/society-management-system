package com.gstech.saas.accounting.overview.controller;

import com.gstech.saas.accounting.overview.dto.AccountingOverviewResponse;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/accounting/overview")
@RequiredArgsConstructor
@Tag(name = "Accounting Overview", description = "Summary stats for the accounting dashboard")
public class AccountingOverviewController {

    // TODO : inject LedgerService and BillService to compute real values

    @GetMapping
    public ResponseEntity<ApiResponse<AccountingOverviewResponse>> getOverview(
        @RequestParam(required = false) Long associationId,
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to) {

        AccountingOverviewResponse response = new AccountingOverviewResponse(
                BigDecimal.ZERO,  // totalRevenue
                BigDecimal.ZERO,  // totalExpenses
                BigDecimal.ZERO,  // netIncome
                BigDecimal.ZERO   // outstanding
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
