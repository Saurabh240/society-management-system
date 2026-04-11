package com.gstech.saas.accounting.ledger.service;

import com.gstech.saas.accounting.ledger.dto.LedgerFilter;
import com.gstech.saas.accounting.ledger.dto.LedgerRequest;
import com.gstech.saas.accounting.ledger.dto.LedgerResponse;
import com.gstech.saas.accounting.ledger.model.Ledger;
import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import com.gstech.saas.accounting.ledger.specification.LedgerSpecification;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LedgerServiceImpl implements LedgerService {

    private final LedgerRepository ledgerRepository;

    @Override
    @Transactional
    public LedgerResponse createEntry(LedgerRequest request) {
        Ledger ledger = Ledger.builder()
                .journalId(request.journalId())
                .accountId(request.accountId())
                .associationId(request.associationId())
                .date(request.date())
                .description(request.description())
                .debit(request.debit())
                .credit(request.credit())
                .accountingBasis(request.accountingBasis())
                .build();

        return LedgerResponse.from(ledgerRepository.save(ledger));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LedgerResponse> listEntries(LedgerFilter filter, Pageable pageable) {
        Long tenantId = TenantContext.get();

        return ledgerRepository
                .findAll(
                        LedgerSpecification.withFilters(
                                tenantId,
                                filter.associationId(),
                                filter.accountId(),
                                filter.from(),
                                filter.to(),
                                filter.basis()),
                        pageable)
                .map(LedgerResponse::from);
    }
}