package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.util.List;

public record DelinquencyResponse(
        String agingPeriod,
        BigDecimal totalOutstanding,
        int totalDelinquentAccounts,
        double delinquencyRate,
        List<DelinquencyRow> delinquencies
) {}

