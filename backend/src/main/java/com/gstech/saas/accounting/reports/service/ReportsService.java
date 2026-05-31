package com.gstech.saas.accounting.reports.service;

import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.reports.dto.BalanceSheetLineItem;
import com.gstech.saas.accounting.reports.dto.BalanceSheetResponse;
import com.gstech.saas.accounting.reports.repository.ReportsRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportsService {

    private final ReportsRepository reportsRepository;

    public BalanceSheetResponse generateBalanceSheet(Long associationId, LocalDate asOfDate) {

        Long tenantId = TenantContext.get();

        List<BalanceSheetLineItem> assets      = fetchLineItems(tenantId, associationId, asOfDate, AccountType.ASSETS,      true);
        List<BalanceSheetLineItem> liabilities = fetchLineItems(tenantId, associationId, asOfDate, AccountType.LIABILITIES, false);
        List<BalanceSheetLineItem> equity      = fetchLineItems(tenantId, associationId, asOfDate, AccountType.EQUITY,      false);

        BigDecimal totalAssets      = sumBalances(assets);
        BigDecimal totalLiabilities = sumBalances(liabilities);
        BigDecimal totalEquity      = sumBalances(equity);

        BigDecimal liabilitiesPlusEquity = totalLiabilities.add(totalEquity);
        BigDecimal difference            = totalAssets.subtract(liabilitiesPlusEquity);
        boolean    balanced              = difference.compareTo(BigDecimal.ZERO) == 0;

        if (!balanced) {
            log.warn("Balance sheet is NOT balanced for tenantId={}, associationId={}, asOfDate={}. " +
                    "Difference={}", tenantId, associationId, asOfDate, difference);
        }

        return new BalanceSheetResponse(
                asOfDate,
                associationId,
                assets,
                liabilities,
                equity,
                totalAssets,
                totalLiabilities,
                totalEquity,
                difference,
                balanced
        );
    }

    /**
     * Fetch ledger rows for one account type and convert to line items.
     *
     * @param debitNormal true  → balance = debits - credits  (ASSETS, EXPENSES)
     *                    false → balance = credits - debits  (LIABILITIES, EQUITY, INCOME)
     */
    private List<BalanceSheetLineItem> fetchLineItems(
            Long tenantId,
            Long associationId,
            LocalDate asOfDate,
            AccountType accountType,
            boolean debitNormal) {

        return reportsRepository
                .getAccountBalances(tenantId, accountType, associationId, asOfDate)
                .stream()
                .map(row -> {
                    String      accountCode  = (String)     row[1];
                    String      accountName  = (String)     row[2];
                    BigDecimal  totalDebit   = (BigDecimal) row[3];
                    BigDecimal  totalCredit  = (BigDecimal) row[4];

                    BigDecimal balance = debitNormal
                            ? totalDebit.subtract(totalCredit)   // ASSETS: DR - CR
                            : totalCredit.subtract(totalDebit);  // LIABILITIES/EQUITY: CR - DR

                    return new BalanceSheetLineItem(accountCode, accountName, balance);
                })
                .filter(item -> item.balance().compareTo(BigDecimal.ZERO) != 0) // skip zero-balance accounts
                .toList();
    }

    private BigDecimal sumBalances(List<BalanceSheetLineItem> items) {
        return items.stream()
                .map(BalanceSheetLineItem::balance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}