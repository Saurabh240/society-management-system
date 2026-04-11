package com.gstech.saas.accounting.journal.service;

import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.journal.dto.JournalLineRequest;
import com.gstech.saas.accounting.journal.dto.JournalLineResponse;
import com.gstech.saas.accounting.journal.dto.JournalRequest;
import com.gstech.saas.accounting.journal.dto.JournalResponse;
import com.gstech.saas.accounting.journal.model.Journal;
import com.gstech.saas.accounting.journal.model.JournalLine;
import com.gstech.saas.accounting.journal.repository.JournalRepository;
import com.gstech.saas.accounting.ledger.model.Ledger;
import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalRepository journalRepository;
    private final LedgerRepository ledgerRepository;
    private final CoaRepository      coaRepository;

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Transactional
    public JournalResponse createJournalEntry(JournalRequest request) {
        Long tenantId = TenantContext.get();

        // 1. Validate double-entry balance: total debits must equal total credits
        validateBalance(request.lines());

        // 2. Build and save the Journal header
        Journal journal = Journal.builder()
                .associationId(request.associationId())
                .date(request.date())
                .memo(request.memo())
                .build();
        // BaseEntity @PrePersist sets tenantId automatically

        // 3. Build and attach JournalLines
        List<JournalLine> lines = request.lines().stream()
                .map(lineReq -> JournalLine.builder()
                        .journal(journal)
                        .accountId(lineReq.accountId())
                        .description(lineReq.description())
                        .debit(lineReq.debit())
                        .credit(lineReq.credit())
                        .build())
                .collect(Collectors.toList());

        journal.setLines(lines);
        Journal saved = journalRepository.save(journal); // cascade saves lines

        // 4. Auto-create one Ledger row per journal line
        List<Ledger> ledgerEntries = saved.getLines().stream()
                .map(line -> Ledger.builder()
                        .journalId(saved.getId())
                        .accountId(line.getAccountId())
                        .associationId(saved.getAssociationId())
                        .date(saved.getDate())
                        .description(line.getDescription())
                        .debit(line.getDebit())
                        .credit(line.getCredit())
                        .accountingBasis("CASH") // default; can extend to ACCRUAL later
                        .build())
                .collect(Collectors.toList());

        ledgerRepository.saveAll(ledgerEntries);

        log.info("[Journal] Created id={} lines={} tenantId={}", saved.getId(), lines.size(), tenantId);

        // 5. Build response (join account names from CoA)
        return toResponse(saved);
    }

    // ── LIST ──────────────────────────────────────────────────────────────────

    public List<JournalResponse> listJournalEntries() {
        return journalRepository
                .findByTenantIdOrderByDateDesc(TenantContext.get())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── INTERNAL ─────────────────────────────────────────────────────────────

    /**
     * Double-entry validation: sum(debits) == sum(credits).
     * Throws IllegalArgumentException (→ 400) if unbalanced.
     */
    private void validateBalance(List<JournalLineRequest> lines) {
        BigDecimal totalDebit  = lines.stream()
                .map(JournalLineRequest::debit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = lines.stream()
                .map(JournalLineRequest::credit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new IllegalArgumentException(
                    String.format("Journal entry is not balanced: debits=%s, credits=%s",
                            totalDebit, totalCredit));
        }
        if (totalDebit.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("Journal entry must have non-zero amounts");
        }
    }

    private JournalResponse toResponse(Journal journal) {
        // Load CoA names for all account IDs in the lines — single batch query
        List<Long> accountIds = journal.getLines().stream()
                .map(JournalLine::getAccountId)
                .distinct()
                .toList();

        Map<Long, Coa> coaMap = coaRepository.findAllById(accountIds)
                .stream()
                .collect(Collectors.toMap(Coa::getId, Function.identity()));

        List<JournalLineResponse> lineResponses = journal.getLines().stream()
                .map(line -> {
                    Coa coa = coaMap.get(line.getAccountId());
                    return new JournalLineResponse(
                            line.getId(),
                            line.getAccountId(),
                            coa != null ? coa.getAccountName() : "Unknown",
                            line.getDescription(),
                            line.getDebit(),
                            line.getCredit()
                    );
                })
                .toList();

        return new JournalResponse(
                journal.getId(),
                journal.getAssociationId(),
                journal.getDate(),
                journal.getMemo(),
                lineResponses,
                journal.getCreatedAt()
        );
    }
}
