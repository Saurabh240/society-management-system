package com.gstech.saas.accounting.journal.dto;

import com.gstech.saas.accounting.ledger.dto.LedgerSourceType;
import com.gstech.saas.accounting.ledger.dto.LineBasis;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record JournalLineRequest(
        @NotNull Long accountId,
        String description,
        @NotNull BigDecimal debit,
        @NotNull BigDecimal credit,
        LedgerSourceType sourceType,
        LineBasis basis
) {
    public JournalLineRequest {
        if (sourceType == null) sourceType = LedgerSourceType.OTHER;
        if (basis == null) basis = LineBasis.BOTH;
    }
    public JournalLineRequest(Long accountId, String description, BigDecimal debit, BigDecimal credit) {
        this(accountId, description, debit, credit, LedgerSourceType.OTHER, LineBasis.BOTH);
    }
    public JournalLineRequest(Long accountId, String description, BigDecimal debit, BigDecimal credit,
                              LedgerSourceType sourceType) {
        this(accountId, description, debit, credit, sourceType, LineBasis.BOTH);
    }
}

