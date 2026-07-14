package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DelinquencyRow(
        Long unitId,
        String unitNumber,
        String ownerName,
        String ownerEmail,
        BigDecimal outstandingAmount,
        LocalDate dueDate,
        int daysOverdue,
        String agingBucket
) {}

