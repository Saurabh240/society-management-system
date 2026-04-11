package com.gstech.saas.accounting.ledger.service;

import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.ledger.dto.LedgerEntryResponse;
import com.gstech.saas.accounting.ledger.model.Ledger;
import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LedgerService {

    private final LedgerRepository ledgerRepository;
    private final CoaRepository    coaRepository;

    /**
     * Fetch ledger entries with optional filters.
     * All params may be null — returns all entries for the tenant when no filters applied.
     */
    public List<LedgerEntryResponse> getLedgerEntries(
            Long associationId,
            Long accountId,
            LocalDate fromDate,
            LocalDate toDate,
            String basis) {

        Long tenantId = TenantContext.get();

        List<Ledger> entries = ledgerRepository.findFiltered(
                tenantId, associationId, accountId, fromDate, toDate,
                (basis != null && !basis.isBlank()) ? basis.toUpperCase() : null
        );

        // Batch-load CoA names for all distinct account IDs
        List<Long> accountIds = entries.stream()
                .map(Ledger::getAccountId)
                .distinct()
                .toList();

        Map<Long, Coa> coaMap = coaRepository.findAllById(accountIds)
                .stream()
                .collect(Collectors.toMap(Coa::getId, Function.identity()));

        return entries.stream()
                .map(e -> {
                    Coa coa = coaMap.get(e.getAccountId());
                    return new LedgerEntryResponse(
                            e.getId(),
                            e.getDate(),
                            e.getAccountId(),
                            coa != null ? coa.getAccountName() : "Unknown",
                            coa != null ? coa.getAccountCode() : null,
                            e.getAssociationId(),
                            e.getDescription(),
                            e.getDebit(),
                            e.getCredit(),
                            e.getAccountingBasis(),
                            e.getJournalId()
                    );
                })
                .toList();
    }
}
