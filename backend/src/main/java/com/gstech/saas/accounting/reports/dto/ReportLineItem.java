package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;

public record ReportLineItem(
        String accountCode,
        String accountName,
        BigDecimal balance
) {}

