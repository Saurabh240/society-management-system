package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StatementRow(
        LocalDate date,
        String description,
        String type,
        BigDecimal amount,
        BigDecimal runningBalance
) {}