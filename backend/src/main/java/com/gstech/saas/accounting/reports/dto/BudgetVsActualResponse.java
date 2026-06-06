package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BudgetVsActualResponse(
        String budgetName,
        LocalDate from,
        LocalDate to,
        BigDecimal totalBudgeted,
        BigDecimal totalActual,
        BigDecimal totalVariance,
        List<BudgetVsActualRow> rows
) {}