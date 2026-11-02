package com.gstech.saas.accounting.ledger.service;

import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.dto.LedgerEntryResponse;
import com.gstech.saas.accounting.ledger.dto.LedgerFilter;
import com.gstech.saas.accounting.ledger.dto.LedgerStatementResponse;
import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.ledger.model.Ledger;
import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import com.gstech.saas.accounting.ledger.specification.LedgerSpecification;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LedgerServiceImpl implements LedgerService {

    private final LedgerRepository ledgerRepository;
    private final CoaRepository    coaRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<LedgerEntryResponse> getLedgerEntries(LedgerFilter filter, Pageable pageable) {
        Long tenantId = TenantContext.get();

        // Lines posted with basis BOTH (banking transactions, bill/unit payment cash
        // legs) are stored once per accounting basis. A request that doesn't name a
        // basis would return every such transaction twice (one CASH row + one
        // ACCRUAL row), so default to CASH — the real money movement.
        AccountingBasis basis = filter.basis() != null ? filter.basis() : AccountingBasis.CASH;

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
                        basis),
                pageable);

        // ── 2. Collect unique accountIds from this page ────────────────────────
        Set<Long> accountIds = ledgerPage.stream()
                .map(Ledger::getAccountId)
                .collect(Collectors.toSet());

        // ── 3. Batch-fetch CoA records in ONE query (avoids N+1) ──────────────
        Map<Long, String> accountNameMap = coaRepository
                .findByTenantIdAndIdInAndIsDeletedFalse(tenantId, accountIds)
                .stream()
                .collect(Collectors.toMap(Coa::getId, Coa::getAccountName));

        // ── 4. Map each Ledger → LedgerEntryResponse with resolved accountName ─
        return ledgerPage.map(ledger -> LedgerEntryResponse.from(
                ledger,
                accountNameMap.getOrDefault(ledger.getAccountId(), "Unknown Account")
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public LedgerStatementResponse getAccountStatement(Long accountId, Long associationId, LocalDate from,
                                                       LocalDate to, String type, AccountingBasis basis) {
        Long tenantId = TenantContext.get();
        AccountingBasis b = basis != null ? basis : AccountingBasis.CASH;   // see getLedgerEntries

        Coa coa = coaRepository.findByIdAndTenantId(accountId, tenantId).orElse(null);
        // Assets / expenses grow with debits; liabilities / equity / income grow with credits.
        boolean debitNormal = coa == null
                || coa.getAccountType() == AccountType.ASSETS
                || coa.getAccountType() == AccountType.EXPENSES;

        // Everything up to `to`, oldest first, so the balance carries forward from before `from`.
        List<Ledger> all = new ArrayList<>(ledgerRepository.findAll(
                LedgerSpecification.withFilters(tenantId, associationId, List.of(accountId), null, to, b)));
        all.sort(Comparator.comparing(Ledger::getDate).thenComparing(Ledger::getId));

        BigDecimal opening = BigDecimal.ZERO;
        BigDecimal running = BigDecimal.ZERO;
        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;
        List<LedgerStatementResponse.Row> rows = new ArrayList<>();

        for (Ledger l : all) {
            BigDecimal debit = l.getDebit() != null ? l.getDebit() : BigDecimal.ZERO;
            BigDecimal credit = l.getCredit() != null ? l.getCredit() : BigDecimal.ZERO;
            BigDecimal delta = debitNormal ? debit.subtract(credit) : credit.subtract(debit);

            if (from != null && l.getDate().isBefore(from)) {
                opening = opening.add(delta);
                running = running.add(delta);
                continue;
            }

            running = running.add(delta);
            totalDebits = totalDebits.add(debit);
            totalCredits = totalCredits.add(credit);

            boolean show = type == null || type.isBlank()
                    || ("DEPOSIT".equalsIgnoreCase(type) && (debitNormal ? debit : credit).signum() > 0)
                    || ("PAYMENT".equalsIgnoreCase(type) && (debitNormal ? credit : debit).signum() > 0);
            if (show) rows.add(LedgerStatementResponse.Row.of(l, running));
        }

        return new LedgerStatementResponse(
                accountId,
                coa != null ? coa.getAccountName() : "Unknown Account",
                from, to, opening, running, totalDebits, totalCredits, rows);
    }
}
