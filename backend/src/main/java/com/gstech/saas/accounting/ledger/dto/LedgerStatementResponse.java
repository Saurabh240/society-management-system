package com.gstech.saas.accounting.ledger.dto;

import com.gstech.saas.accounting.ledger.model.Ledger;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * One account's ledger with a running balance, like a bank register.
 * Rows are in chronological order (oldest first); {@code runningBalance} is the balance
 * AFTER that row, carried forward from all earlier activity (not just the filtered range).
 */
public record LedgerStatementResponse(
        Long accountId,
        String accountName,
        LocalDate from,
        LocalDate to,
        BigDecimal openingBalance,   // balance just before `from`
        BigDecimal closingBalance,   // balance after the last row up to `to`
        BigDecimal totalDebits,      // within the range
        BigDecimal totalCredits,     // within the range
        List<Row> entries
) {
    public record Row(
            Long id,
            Long journalId,
            LocalDate date,
            String description,
            BigDecimal debit,
            BigDecimal credit,
            BigDecimal runningBalance,
            AccountingBasis accountingBasis,
            Instant createdAt
    ) {
        public static Row of(Ledger l, BigDecimal runningBalance) {
            return new Row(l.getId(), l.getJournalId(), l.getDate(), l.getDescription(),
                    l.getDebit(), l.getCredit(), runningBalance, l.getAccountingBasis(), l.getCreatedAt());
        }
    }
}
