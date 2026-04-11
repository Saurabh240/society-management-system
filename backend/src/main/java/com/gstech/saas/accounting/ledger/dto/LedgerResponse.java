package com.gstech.saas.accounting.ledger.dto;

import com.gstech.saas.accounting.ledger.model.Ledger;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record LedgerResponse(
        Long id,
        Long tenantId,
        Long journalId,
        Long accountId,
        Long associationId,
        LocalDate date,
        String description,
        BigDecimal debit,
        BigDecimal credit,
        AccountingBasis accountingBasis,
        Instant createdAt
) {
    public static LedgerResponse from(Ledger ledger) {
        return new LedgerResponse(
                ledger.getId(),
                ledger.getTenantId(),
                ledger.getJournalId(),
                ledger.getAccountId(),
                ledger.getAssociationId(),
                ledger.getDate(),
                ledger.getDescription(),
                ledger.getDebit(),
                ledger.getCredit(),
                ledger.getAccountingBasis(),
                ledger.getCreatedAt()
        );
    }
}