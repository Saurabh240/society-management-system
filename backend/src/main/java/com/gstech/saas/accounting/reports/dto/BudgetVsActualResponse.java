package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BudgetVsActualResponse(
        String     budgetName,
        LocalDate  from,
        LocalDate  to,
        String     accountingBasis,
        BigDecimal totalBudgetedIncome,
        BigDecimal totalActualIncome,
        BigDecimal totalBudgetedExpenses,
        BigDecimal totalActualExpenses,
        BigDecimal budgetedNetIncome,
        BigDecimal actualNetIncome,
        List<BudgetVsActualRow> incomeRows,
        List<BudgetVsActualRow> expenseRows
) {}