package com.gstech.saas.accounting.ledger.service;

import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
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

    // ===== SUMMARY =====
    @Override
    public UnitLedgerSummaryResponse getSummary(Long unitId) {

        Long tenantId = TenantContext.get();

        Unit unit = unitRepository.findByIdAndTenantId(unitId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found"));

        Long associationId = unit.getAssociation().getId();

        BigDecimal totalCharges =
                ledgerRepository.sumDebitByAssociation(tenantId, associationId);

        BigDecimal totalPayments =
                ledgerRepository.sumCreditByAssociation(tenantId, associationId);

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

        Page<Ledger> ledgerPage = ledgerRepository.findAll(
                LedgerSpecification.withFilters(
                        tenantId,
                        associationId,
                        null,
                        from,
                        to,
                        null
                ),
                pageable
        );

        List<Ledger> filtered = ledgerPage.stream()
                .filter(l -> {
                    if (type == UnitLedgerTransactionType.CHARGE)
                        return l.getDebit().compareTo(BigDecimal.ZERO) > 0;
                    if (type == UnitLedgerTransactionType.PAYMENT)
                        return l.getCredit().compareTo(BigDecimal.ZERO) > 0;
                    return true;
                })
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

            if (ledger.getDebit().compareTo(BigDecimal.ZERO) > 0) {
                amount = ledger.getDebit();
                transactionType = "CHARGE";
                runningBalance = runningBalance.add(amount);
            } else {
                amount = ledger.getCredit();
                transactionType = "PAYMENT";
                runningBalance = runningBalance.subtract(amount);
            }

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