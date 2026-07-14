package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TrialBalanceResponse(
        LocalDate from,
        LocalDate to,
        String accountingBasis,
        BigDecimal totalDebits,
        BigDecimal totalCredits,
        boolean isBalanced,
        List<TrialBalanceRow> accounts
) {}

