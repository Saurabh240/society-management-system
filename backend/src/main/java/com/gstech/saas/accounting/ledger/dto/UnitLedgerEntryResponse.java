package com.gstech.saas.accounting.ledger.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UnitLedgerEntryResponse(
        Long id,
        LocalDate date,
        String description,
        String accountName,
        String transactionType,
        BigDecimal amount,
        BigDecimal runningBalance
) {}