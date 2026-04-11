package com.gstech.saas.accounting.ledger.service;

import com.gstech.saas.accounting.ledger.dto.LedgerFilter;
import com.gstech.saas.accounting.ledger.dto.LedgerRequest;
import com.gstech.saas.accounting.ledger.dto.LedgerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface LedgerService {

    LedgerResponse createEntry(LedgerRequest request);

    Page<LedgerResponse> listEntries(
            LedgerFilter filter, Pageable pageable
    );
}