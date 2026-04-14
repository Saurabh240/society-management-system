package com.gstech.saas.accounting.banking.dto;


import com.gstech.saas.accounting.banking.model.Banking;
import java.math.BigDecimal;
import java.time.Instant;

public record BankAccountResponse(
        Long id,
        Long tenantId,
        Long associationId,
        String bankAccountName,
        BankAccountType accountType,
        String country,
        String routingNumber,
        String accountNumberMasked,   // always "****XXXX" — full number never returned
        String accountNotes,
        Boolean checkPrintingEnabled,
        BigDecimal balance,
        Instant createdAt
) {
    public static BankAccountResponse from(Banking banking) {
        return new BankAccountResponse(
                banking.getId(),
                banking.getTenantId(),
                banking.getAssociationId(),
                banking.getBankAccountName(),
                banking.getAccountType(),
                banking.getCountry(),
                banking.getRoutingNumber(),
                banking.getAccountNumberMasked(),
                banking.getAccountNotes(),
                banking.getCheckPrintingEnabled(),
                banking.getBalance(),
                banking.getCreatedAt()
        );
    }
}