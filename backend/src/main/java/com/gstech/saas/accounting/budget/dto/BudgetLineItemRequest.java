package com.gstech.saas.accounting.budget.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BudgetLineItemRequest(
        @NotNull(message = "Account ID is required")
        Long accountId,

        @NotNull(message = "Budgeted amount is required")
        BigDecimal budgetedAmount,

        String notes
) {}