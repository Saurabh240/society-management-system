package com.gstech.saas.accounting.journal.dto;

import java.math.BigDecimal;

public record JournalLineResponse(
    Long id,
    Long accountId,
    String accountName,   // joined from chart_of_accounts for display
    String description,
    BigDecimal debit,
    BigDecimal credit
) {}
