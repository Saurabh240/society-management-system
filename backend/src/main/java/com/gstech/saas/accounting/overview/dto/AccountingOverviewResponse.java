package com.gstech.saas.accounting.overview.dto;

import java.math.BigDecimal;

public record AccountingOverviewResponse(
    BigDecimal totalRevenue,
    BigDecimal totalExpenses,
    BigDecimal netIncome,
    BigDecimal outstanding   // wired in M7 from bills — zero until then
) {}
