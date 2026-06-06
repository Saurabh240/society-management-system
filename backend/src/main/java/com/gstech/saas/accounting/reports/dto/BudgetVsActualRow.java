package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;

public record BudgetVsActualRow(
        String accountCode,
        String accountName,
        String accountType,
        BigDecimal budgetedAmount,
        BigDecimal actualAmount,
        BigDecimal variance,
        BigDecimal variancePercentage
) {}