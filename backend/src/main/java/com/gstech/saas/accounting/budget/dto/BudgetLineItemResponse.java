package com.gstech.saas.accounting.budget.dto;

import java.math.BigDecimal;

public record BudgetLineItemResponse(
        Long       id,
        Long       accountId,
        String     accountCode,
        String     accountName,
        BigDecimal budgetedAmount,
        String     notes
) {}
