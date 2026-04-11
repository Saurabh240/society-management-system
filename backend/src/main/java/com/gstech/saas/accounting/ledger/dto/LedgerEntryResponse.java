package com.gstech.saas.accounting.ledger.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LedgerEntryResponse(
    Long id,
    LocalDate date,
    Long accountId,
    String accountName,       // joined from chart_of_accounts
    String accountCode,       // joined from chart_of_accounts
    Long associationId,
    String description,
    BigDecimal debit,
    BigDecimal credit,
    String accountingBasis,
    Long journalId
) {}
