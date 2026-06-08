package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;

public record BalanceSheetLineItem(
        String accountCode,
        String accountName,
        BigDecimal balance
) {}