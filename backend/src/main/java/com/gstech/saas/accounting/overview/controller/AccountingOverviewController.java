package com.gstech.saas.accounting.overview.controller;

import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import com.gstech.saas.accounting.overview.dto.AccountingOverviewResponse;
import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/accounting/overview")
@RequiredArgsConstructor
@Tag(name = "Accounting Overview", description = "Summary stats for the accounting dashboard")
public class AccountingOverviewController {

    private final LedgerRepository ledgerRepository;
    // TODO M7: inject BillRepository to compute outstanding (unpaid bills total)

    @Operation(summary = "Get accounting overview stats",
               description = "Returns total revenue, expenses, net income, and outstanding amounts")
    @GetMapping
    public ResponseEntity<ApiResponse<AccountingOverviewResponse>> getOverview() {
        Long tenantId = TenantContext.get();

        // Revenue = sum of credit amounts on INCOME accounts
        BigDecimal totalRevenue = ledgerRepository
                .sumCreditByAccountType(tenantId, "INCOME");

        // Expenses = sum of debit amounts on EXPENSES accounts
        BigDecimal totalExpenses = ledgerRepository
                .sumDebitByAccountType(tenantId, "EXPENSES");

        // Net income = revenue - expenses
        BigDecimal netIncome = totalRevenue.subtract(totalExpenses);

        // Outstanding = unpaid bills total — wired in M7
        BigDecimal outstanding = BigDecimal.ZERO;

        AccountingOverviewResponse response = new AccountingOverviewResponse(
                totalRevenue,
                totalExpenses,
                netIncome,
                outstanding
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
