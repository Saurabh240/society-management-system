package com.gstech.saas.accounting.journal.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record JournalLineRequest(
        @NotNull Long accountId,
        String description,
        @NotNull BigDecimal debit,
        @NotNull BigDecimal credit
) {}
