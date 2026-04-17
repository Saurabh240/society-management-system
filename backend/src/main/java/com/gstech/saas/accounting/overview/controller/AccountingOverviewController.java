package com.gstech.saas.accounting.overview.controller;

import com.gstech.saas.accounting.overview.dto.AccountingOverviewResponse;
import com.gstech.saas.accounting.overview.service.AccountingOverviewService;
import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/accounting/overview")
@RequiredArgsConstructor
@Tag(name = "Accounting Overview", description = "Summary stats for the accounting dashboard")
public class AccountingOverviewController {

    private final AccountingOverviewService accountingOverviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<AccountingOverviewResponse>> getOverview(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {

        Long tenantId = TenantContext.get();

        AccountingOverviewResponse response =
                accountingOverviewService.getOverview(
                        tenantId,
                        associationId,
                        from,
                        to
                );

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}