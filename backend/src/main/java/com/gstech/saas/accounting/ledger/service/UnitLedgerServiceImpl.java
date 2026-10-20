package com.gstech.saas.accounting.ledger.service;

import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.dto.LedgerSourceType;
import com.gstech.saas.accounting.ledger.dto.UnitLedgerEntryResponse;
import com.gstech.saas.accounting.ledger.dto.UnitLedgerSummaryResponse;
import com.gstech.saas.accounting.ledger.dto.UnitLedgerTransactionType;
import com.gstech.saas.accounting.ledger.model.Ledger;
import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import com.gstech.saas.accounting.ledger.specification.LedgerSpecification;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import com.gstech.saas.associations.unit.model.Unit;
import com.gstech.saas.associations.unit.repository.UnitRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnitLedgerServiceImpl implements UnitLedgerService {

    private final UnitRepository unitRepository;
    private final LedgerRepository ledgerRepository;
    private final CoaRepository coaRepository;

    private static final String AR_ACCOUNT_CODE = "1100";

    // ===== SUMMARY =====
    @Override
    public UnitLedgerSummaryResponse getSummary(Long unitId) {

        Long tenantId = TenantContext.get();

        Unit unit = unitRepository.findByIdAndTenantId(unitId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found"));

        // Scoped to this unit's own ACCRUAL-basis lines so it mirrors exactly how
        // Unit.balance is maintained (+ on invoice, - on payment):
        // totalCharges - totalPayments always reconciles with the current balance.
        BigDecimal totalCharges = ledgerRepository.sumDebitByUnitBasisAndSourceType(
                tenantId, unitId, AccountingBasis.ACCRUAL, LedgerSourceType.INVOICE_CHARGE);

        BigDecimal totalPayments = ledgerRepository.sumCreditByUnitBasisAndSourceType(
                tenantId, unitId, AccountingBasis.ACCRUAL, LedgerSourceType.PAYMENT_RECEIVED);

        return new UnitLedgerSummaryResponse(
                unit.getBalance(),
                totalCharges,
                totalPayments
        );
    }

    // ===== TRANSACTIONS =====
    @Override
    public Page<UnitLedgerEntryResponse> getTransactions(
            Long unitId,
            LocalDate from,
            LocalDate to,
            UnitLedgerTransactionType type,
            Pageable pageable) {

        Long tenantId = TenantContext.get();

        Unit unit = unitRepository.findByIdAndTenantId(unitId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found"));

        Long associationId = unit.getAssociation().getId();

        // A unit's ledger is its Accounts-Receivable account, nothing else. An
        // invoice is posted as: Dr A/R (the charge) + Cr Income (one line per
        // item), and a payment as Dr Cash + Cr A/R + Cr Income (cash basis).
        // Listing every line made one invoice appear as two rows (the A/R debit
        // AND the income credit, netting the running balance back to zero) and
        // each payment as three. Restricting to the A/R account on the ACCRUAL
        // basis yields exactly one row per charge and one per payment, and the
        // running balance then matches the unit's balance.
        List<Long> arAccountIds = coaRepository
                .findByTenantIdAndAccountCodeAndIsDeletedFalse(tenantId, AR_ACCOUNT_CODE)
                .map(c -> List.of(c.getId()))
                .orElse(null);

        Page<Ledger> ledgerPage = ledgerRepository.findAll(
                LedgerSpecification.withFilters(
                        tenantId,
                        associationId,
                        arAccountIds,
                        from,
                        to,
                        AccountingBasis.ACCRUAL,
                        unitId
                ),
                pageable
        );

        List<Ledger> filtered = ledgerPage.stream()
                .filter(l -> {
                    boolean isPayment = l.getSourceType() == LedgerSourceType.PAYMENT_RECEIVED;
                    if (type == UnitLedgerTransactionType.CHARGE)
                        return !isPayment;
                    if (type == UnitLedgerTransactionType.PAYMENT)
                        return isPayment;
                    return true;
                })
                .sorted(Comparator.comparing(Ledger::getDate).thenComparing(Ledger::getId))
                .toList();

        Set<Long> accountIds = filtered.stream()
                .map(Ledger::getAccountId)
                .collect(Collectors.toSet());

        Map<Long, String> accountNameMap =
                coaRepository.findByTenantIdAndIdInAndIsDeletedFalse(tenantId, accountIds)
                        .stream()
                        .collect(Collectors.toMap(Coa::getId, Coa::getAccountName));

        BigDecimal runningBalance = BigDecimal.ZERO;
        List<UnitLedgerEntryResponse> responseList = new ArrayList<>();

        for (Ledger ledger : filtered) {

            BigDecimal amount;
            String transactionType;

            boolean isDebit = ledger.getDebit().compareTo(BigDecimal.ZERO) > 0;
            amount = isDebit ? ledger.getDebit() : ledger.getCredit();

            // "PAYMENT" only for entries actually tagged as money received.
            transactionType = ledger.getSourceType() == LedgerSourceType.PAYMENT_RECEIVED ? "PAYMENT" : "CHARGE";

            runningBalance = isDebit ? runningBalance.add(amount) : runningBalance.subtract(amount);

            responseList.add(new UnitLedgerEntryResponse(
                    ledger.getId(),
                    ledger.getDate(),
                    ledger.getDescription(),
                    accountNameMap.getOrDefault(ledger.getAccountId(), "Unknown Account"),
                    transactionType,
                    amount,
                    runningBalance
            ));
        }

        return new PageImpl<>(responseList, pageable, ledgerPage.getTotalElements());
    }
}