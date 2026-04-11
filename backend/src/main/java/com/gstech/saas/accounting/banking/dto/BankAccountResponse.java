package com.gstech.saas.accounting.banking.dto;

import com.gstech.saas.accounting.banking.model.BankAccountType;

import java.math.BigDecimal;
import java.time.Instant;

public record BankAccountResponse(
    Long id,
    Long associationId,
    String associationName,          // joined for display — avoid extra frontend call
    String bankAccountName,
    BankAccountType accountType,
    String country,
    String routingNumber,
    String accountNumberMasked,      // "****5678" — full number never returned
    String accountNotes,
    Boolean checkPrintingEnabled,
    BigDecimal balance,
    Instant createdAt
) {}
