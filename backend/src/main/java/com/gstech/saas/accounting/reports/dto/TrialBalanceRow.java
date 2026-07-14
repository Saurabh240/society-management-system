package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;

public record TrialBalanceRow(
        String accountCode,
        String accountName,
        String accountType,
        BigDecimal totalDebit,
        BigDecimal totalCredit,
        BigDecimal balance
) {}

