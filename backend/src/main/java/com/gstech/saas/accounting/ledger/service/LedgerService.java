package com.gstech.saas.accounting.ledger.service;

import com.gstech.saas.accounting.ledger.dto.LedgerEntryResponse;
import com.gstech.saas.accounting.ledger.dto.LedgerFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LedgerService {

    /**
     * Returns a filtered, paginated ledger view for the current tenant.
     * All filter params inside LedgerFilter are optional (null = skip that filter).
     * Account names are resolved from CoA and included in each response row.
     */
    Page<LedgerEntryResponse> getLedgerEntries(LedgerFilter filter, Pageable pageable);
}