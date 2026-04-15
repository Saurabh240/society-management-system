package com.gstech.saas.accounting.banking.dto;


import com.gstech.saas.accounting.banking.model.Banking;
import java.math.BigDecimal;
import java.time.Instant;

public record BankAccountResponse(
        Long id,
        Long associationId,
        String associationName,
        String bankAccountName,
        BankAccountType accountType,
        String country,
        String routingNumber,
        String accountNumberMasked,   // always "****XXXX" — full number never returned
        String accountNotes,
        Boolean checkPrintingEnabled,
        BigDecimal balance,
        Instant createdAt
){}