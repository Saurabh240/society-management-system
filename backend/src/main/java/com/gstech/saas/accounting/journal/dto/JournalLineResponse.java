package com.gstech.saas.accounting.journal.dto;

import java.math.BigDecimal;

public record JournalLineResponse(
        Long id,
        Long accountId,
        String description,
        BigDecimal debit,
        BigDecimal credit
) {}