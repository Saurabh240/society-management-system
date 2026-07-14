package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record VendorLedgerRow(
        LocalDate  date,
        String     billNumber,
        String     description,
        BigDecimal amount,
        String     status,           // UNPAID | PAID | OVERDUE
        BigDecimal runningBalance
) {}