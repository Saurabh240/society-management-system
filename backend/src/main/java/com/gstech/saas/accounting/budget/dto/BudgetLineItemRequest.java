package com.gstech.saas.accounting.budget.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record BudgetLineItemRequest(
        @NotNull(message = "Account ID is required")
        Long accountId,

        @NotNull @PositiveOrZero(message = "Budgeted amount must be zero or positive")
        BigDecimal budgetedAmount,

        String notes
) {}