package com.gstech.saas.accounting.ledger.dto;


import com.gstech.saas.accounting.ledger.model.Ledger;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record LedgerEntryResponse(
        Long id,
        Long tenantId,
        Long journalId,
        Long accountId,
        String accountName,          // resolved from CoA
        Long associationId,
        LocalDate date,
        String description,
        BigDecimal debit,
        BigDecimal credit,
        AccountingBasis accountingBasis,
        Instant createdAt
) {
    public static LedgerEntryResponse from(Ledger ledger, String accountName) {
        return new LedgerEntryResponse(
                ledger.getId(),
                ledger.getTenantId(),
                ledger.getJournalId(),
                ledger.getAccountId(),
                accountName,
                ledger.getAssociationId(),
                ledger.getDate(),
                ledger.getDescription(),
                ledger.getDebit(),
                ledger.getCredit(),
                ledger.getAccountingBasis(),
                ledger.getCreatedAt()
        );
    }

    public static LedgerEntryResponse from(Ledger ledger) {
        return from(ledger, "Unknown Account");
    }
}