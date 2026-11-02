package com.gstech.saas.accounting.ledger.service;

import com.gstech.saas.accounting.ledger.dto.LedgerEntryResponse;
import com.gstech.saas.accounting.ledger.dto.LedgerFilter;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.dto.LedgerStatementResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface LedgerService {

    /**
     * Returns a filtered, paginated ledger view for the current tenant.
     * All filter params inside LedgerFilter are optional (null = skip that filter).
     * Account names are resolved from CoA and included in each response row.
     */
    Page<LedgerEntryResponse> getLedgerEntries(LedgerFilter filter, Pageable pageable);

    /**
     * Register-style view of ONE account with a running balance.
     * @param type optional "DEPOSIT" (money in / debit) or "PAYMENT" (money out / credit) display filter;
     *             the running balance always includes every transaction.
     */
    LedgerStatementResponse getAccountStatement(Long accountId, Long associationId, LocalDate from,
                                                LocalDate to, String type, AccountingBasis basis);
}
