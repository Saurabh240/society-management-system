package com.gstech.saas.accounting.journal.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record JournalLineRequest(

    @NotNull(message = "Account is required")
    Long accountId,

    String description,

    BigDecimal debit,

    BigDecimal credit
) {
    // Normalize nulls to zero so balance calculation never NPEs
    public JournalLineRequest {
        if (debit  == null) debit  = BigDecimal.ZERO;
        if (credit == null) credit = BigDecimal.ZERO;
    }
}
