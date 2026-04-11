package com.gstech.saas.accounting.ledger.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LedgerRequest(
        Long journalId,
        @NotNull(message = "accountId is required")
        Long accountId,
        @NotNull(message = "associationId is required")
        Long associationId,
        @NotNull(message = "date is required")
        LocalDate date,
        String description,
        @NotNull(message = "debit is required")
        @PositiveOrZero(message = "debit must be zero or positive")
        BigDecimal debit,
        @NotNull(message = "credit is required")
        @PositiveOrZero(message = "credit must be zero or positive")
        BigDecimal credit,
        @NotNull(message = "accountingBasis is required")
        AccountingBasis accountingBasis
) {}