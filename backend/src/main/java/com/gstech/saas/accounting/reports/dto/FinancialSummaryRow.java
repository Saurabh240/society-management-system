package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;

public record FinancialSummaryRow(
        String label,
        BigDecimal value
) {}

