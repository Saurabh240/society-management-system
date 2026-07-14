package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record FinancialSummaryResponse(
        LocalDate from,
        LocalDate to,
        BigDecimal totalRevenue,
        BigDecimal totalExpenses,
        BigDecimal netIncome,
        BigDecimal totalAssets,
        BigDecimal totalLiabilities,
        BigDecimal totalEquity,
        BigDecimal outstandingCharges,
        BigDecimal collectionRate,
        List<FinancialSummaryRow> summary
) {}

