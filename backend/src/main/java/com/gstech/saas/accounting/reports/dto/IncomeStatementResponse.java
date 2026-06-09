package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record IncomeStatementResponse(
        LocalDate from,
        LocalDate to,
        String accountingBasis,
        BigDecimal totalRevenue,
        BigDecimal totalExpenses,
        BigDecimal netIncome,
        List<ReportLineItem> revenue,
        List<ReportLineItem> expenses
) {}

