package com.gstech.saas.accounting.journal.service;

import com.gstech.saas.accounting.journal.dto.CreateJournalRequest;
import com.gstech.saas.accounting.journal.dto.JournalLineRequest;
import com.gstech.saas.accounting.journal.dto.JournalLineResponse;
import com.gstech.saas.accounting.journal.dto.JournalResponse;
import com.gstech.saas.accounting.journal.specification.JournalSpecification;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.dto.LineBasis;
import com.gstech.saas.accounting.ledger.model.Ledger;
import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;
import com.gstech.saas.accounting.journal.model.Journal;
import com.gstech.saas.accounting.journal.model.JournalLine;
import com.gstech.saas.accounting.journal.repository.JournalRepository;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class JournalService {

    private final JournalRepository journalRepository;
    private final LedgerRepository ledgerRepository;

    public JournalResponse create(CreateJournalRequest request) {

        validateBalanced(request.lines());

        Journal journal = Journal.builder()
                .associationId(request.associationId())
                .date(request.date())
                .memo(request.memo())
                .attachmentPath(request.attachmentPath())
                .build();

        List<JournalLine> lines = request.lines().stream()
                .map(line -> JournalLine.builder()
                        .journal(journal)
                        .accountId(line.accountId())
                        .description(line.description())
                        .debit(line.debit())
                        .credit(line.credit())
                        .sourceType(line.sourceType())
                        .basis(line.basis())
                        .build())
                .toList();

        journal.setLines(lines);

        Journal saved = journalRepository.save(journal);

        createLedgerEntries(saved);

        return toResponse(saved);
    }

    public Page<JournalResponse> list(
            Long associationId,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {
        Long tenantId = TenantContext.get();

        return journalRepository
                .findAll(JournalSpecification.withFilters(tenantId, associationId, from, to), pageable)
                .map(this::toResponse);
    }

    private boolean appliesTo(LineBasis lineBasis, AccountingBasis basis) {
        return lineBasis == null || lineBasis == LineBasis.BOTH || lineBasis.name().equals(basis.name());
    }

    private void validateBalanced(List<JournalLineRequest> lines) {
        for (AccountingBasis basis : AccountingBasis.values()) {
            BigDecimal debit = BigDecimal.ZERO, credit = BigDecimal.ZERO;
            for (JournalLineRequest l : lines) {
                if (appliesTo(l.basis(), basis)) {
                    debit = debit.add(l.debit());
                    credit = credit.add(l.credit());
                }
            }
            if (debit.compareTo(credit) != 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Journal entry must be balanced (debits = credits) on the " + basis + " basis");
            }
        }
    }

    private void createLedgerEntries(Journal journal) {
        List<Ledger> ledgerEntries = new ArrayList<>();
        for (JournalLine line : journal.getLines()) {
            for (AccountingBasis basis : AccountingBasis.values()) {
                if (!appliesTo(line.getBasis(), basis)) continue;
                ledgerEntries.add(Ledger.builder()
                        .journalId(journal.getId())
                        .associationId(journal.getAssociationId())
                        .accountId(line.getAccountId())
                        .date(journal.getDate())
                        .description(line.getDescription())
                        .debit(line.getDebit())
                        .credit(line.getCredit())
                        .accountingBasis(basis)
                        .sourceType(line.getSourceType())
                        .build());
            }
        }
        ledgerRepository.saveAll(ledgerEntries);
    }



    private JournalResponse toResponse(Journal journal) {
        return new JournalResponse(
                journal.getId(),
                journal.getDate(),
                journal.getAssociationId(),
                journal.getMemo(),
                journal.getAttachmentPath(),
                journal.getLines().stream()
                        .map(line -> new JournalLineResponse(
                                line.getId(),
                                line.getAccountId(),
                                line.getDescription(),
                                line.getDebit(),
                                line.getCredit()
                        ))
                        .toList()
        );
    }
}