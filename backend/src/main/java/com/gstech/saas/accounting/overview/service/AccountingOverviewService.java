package com.gstech.saas.accounting.overview.service;

import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.overview.dto.AccountingOverviewResponse;
import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AccountingOverviewService {

    private final LedgerRepository ledgerRepository;

    public AccountingOverviewResponse getOverview(
            Long tenantId,
            Long associationId,
            LocalDate from,
            LocalDate to) {

        BigDecimal totalRevenue =
                ledgerRepository.sumCreditByAccountType(
                        tenantId,
                        AccountType.INCOME,
                        associationId,
                        from,
                        to
                );

        BigDecimal totalExpenses =
                ledgerRepository.sumDebitByAccountType(
                        tenantId,
                        AccountType.EXPENSES,
                        associationId,
                        from,
                        to
                );

        BigDecimal netIncome = totalRevenue.subtract(totalExpenses);

        BigDecimal outstanding = BigDecimal.ZERO; // TODO M7 (BillRepository)

        return new AccountingOverviewResponse(
                totalRevenue,
                totalExpenses,
                netIncome,
                outstanding
        );
    }
}