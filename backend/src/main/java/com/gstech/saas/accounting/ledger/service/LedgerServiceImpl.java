package com.gstech.saas.accounting.ledger.service;

import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.ledger.dto.LedgerEntryResponse;
import com.gstech.saas.accounting.ledger.dto.LedgerFilter;
import com.gstech.saas.accounting.ledger.model.Ledger;
import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import com.gstech.saas.accounting.ledger.specification.LedgerSpecification;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LedgerServiceImpl implements LedgerService {

    private final LedgerRepository ledgerRepository;
    private final CoaRepository    coaRepository;      // for account name resolution

    @Override
    @Transactional(readOnly = true)
    public Page<LedgerEntryResponse> getLedgerEntries(LedgerFilter filter, Pageable pageable) {
        Long tenantId = TenantContext.get();

        // ── 1. Fetch filtered page via Specification ───────────────────────────
        // LedgerSpecification builds null-safe predicates — only adds a WHERE clause
        // for each filter param that is non-null, which avoids the PostgreSQL
        // "could not determine data type of parameter" error from @Query IS NULL OR.
        Page<Ledger> ledgerPage = ledgerRepository.findAll(
                LedgerSpecification.withFilters(
                        tenantId,
                        filter.associationId(),
                        filter.accountId(),
                        filter.from(),
                        filter.to(),
                        filter.basis()),
                pageable);

        // ── 2. Collect unique accountIds from this page ────────────────────────
        Set<Long> accountIds = ledgerPage.stream()
                .map(Ledger::getAccountId)
                .collect(Collectors.toSet());

        // ── 3. Batch-fetch CoA records in ONE query (avoids N+1) ──────────────
        Map<Long, String> accountNameMap = coaRepository.findByIdIn(accountIds)
                .stream()
                .collect(Collectors.toMap(Coa::getId, Coa::getAccountName));

        // ── 4. Map each Ledger → LedgerEntryResponse with resolved accountName ─
        return ledgerPage.map(ledger -> LedgerEntryResponse.from(
                ledger,
                accountNameMap.getOrDefault(ledger.getAccountId(), "Unknown Account")
        ));
    }
}