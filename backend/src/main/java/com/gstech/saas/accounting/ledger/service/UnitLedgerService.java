package com.gstech.saas.accounting.ledger.service;

import com.gstech.saas.accounting.ledger.dto.UnitLedgerEntryResponse;
import com.gstech.saas.accounting.ledger.dto.UnitLedgerSummaryResponse;
import com.gstech.saas.accounting.ledger.dto.UnitLedgerTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface UnitLedgerService {

    UnitLedgerSummaryResponse getSummary(Long unitId);

    Page<UnitLedgerEntryResponse> getTransactions(
            Long unitId,
            LocalDate from,
            LocalDate to,
            UnitLedgerTransactionType type,
            Pageable pageable
    );
}