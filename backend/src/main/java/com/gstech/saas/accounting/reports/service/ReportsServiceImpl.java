package com.gstech.saas.accounting.reports.service;

import com.gstech.saas.accounting.bills.model.Bill;
import com.gstech.saas.accounting.bills.model.BillStatus;
import com.gstech.saas.accounting.bills.repository.BillRepository;
import com.gstech.saas.accounting.budget.model.Budget;
import com.gstech.saas.accounting.budget.model.BudgetLineItem;
import com.gstech.saas.accounting.budget.repository.BudgetRepository;
import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import com.gstech.saas.accounting.reports.dto.*;
import com.gstech.saas.associations.vendor.model.Vendor;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportsServiceImpl implements ReportsService {

    private final LedgerRepository ledgerRepository;
    private final CoaRepository coaRepository;
    private final BillRepository billRepository;
    private final VendorRepository vendorRepository;
    private final BudgetRepository budgetRepository;

    @Override
    public BalanceSheetResponse getBalanceSheet(
            Long associationId,
            LocalDate asOfDate,
            AccountingBasis basis
    ) {

        Long tenantId = requireTenantId();

        LocalDate effectiveDate =
                asOfDate == null ? LocalDate.now() : asOfDate;

        AccountingBasis accountingBasis =
                basis == null ? AccountingBasis.ACCRUAL : basis;

        List<Object[]> rows =
                ledgerRepository.sumDebitCreditByAccountUpToDate(
                        tenantId,
                        associationId,
                        effectiveDate,
                        accountingBasis
                );

        if (rows.isEmpty()) {
            return new BalanceSheetResponse(
                    effectiveDate,
                    accountingBasis.name(),
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    true,
                    List.of(),
                    List.of(),
                    List.of()
            );
        }

        Set<Long> accountIds = rows.stream()
                .map(r -> (Long) r[0])
                .collect(Collectors.toSet());

        List<Coa> coaList =
                coaRepository.findByTenantIdAndIdInAndIsDeletedFalse(
                        tenantId,
                        accountIds
                );

        Map<Long, Coa> coaMap =
                coaList.stream()
                        .collect(Collectors.toMap(
                                Coa::getId,
                                Function.identity()
                        ));

        List<ReportLineItem> assets = new ArrayList<>();
        List<ReportLineItem> liabilities = new ArrayList<>();
        List<ReportLineItem> equity = new ArrayList<>();

        BigDecimal totalAssets = BigDecimal.ZERO;
        BigDecimal totalLiabilities = BigDecimal.ZERO;
        BigDecimal totalEquity = BigDecimal.ZERO;

        for (Object[] row : rows) {

            Long accountId = (Long) row[0];

            BigDecimal debit =
                    row[1] == null
                            ? BigDecimal.ZERO
                            : (BigDecimal) row[1];

            BigDecimal credit =
                    row[2] == null
                            ? BigDecimal.ZERO
                            : (BigDecimal) row[2];

            Coa coa = coaMap.get(accountId);

            if (coa == null) {
                continue;
            }

            BigDecimal balance;

            switch (coa.getAccountType()) {

                case ASSETS -> {

                    balance = debit.subtract(credit);

                    assets.add(
                            new ReportLineItem(
                                    coa.getAccountCode(),
                                    coa.getAccountName(),
                                    balance
                            )
                    );

                    totalAssets = totalAssets.add(balance);
                }

                case LIABILITIES -> {

                    balance = credit.subtract(debit);

                    liabilities.add(
                            new ReportLineItem(
                                    coa.getAccountCode(),
                                    coa.getAccountName(),
                                    balance
                            )
                    );

                    totalLiabilities = totalLiabilities.add(balance);
                }

                case EQUITY -> {

                    balance = credit.subtract(debit);

                    equity.add(
                            new ReportLineItem(
                                    coa.getAccountCode(),
                                    coa.getAccountName(),
                                    balance
                            )
                    );

                    totalEquity = totalEquity.add(balance);
                }

                default -> {
                    // Ignore income/expense accounts
                }
            }
        }

        BigDecimal totalLiabilitiesAndEquity =
                totalLiabilities.add(totalEquity);

        boolean balanced =
                totalAssets.compareTo(
                        totalLiabilitiesAndEquity
                ) == 0;

        return new BalanceSheetResponse(
                effectiveDate,
                accountingBasis.name(),
                totalAssets,
                totalLiabilities,
                totalEquity,
                totalLiabilitiesAndEquity,
                balanced,
                assets,
                liabilities,
                equity
        );
    }

    @Override
    public IncomeStatementResponse getIncomeStatement(
            Long associationId,
            ReportDateRange dateRange,
            LocalDate from,
            LocalDate to,
            AccountingBasis basis,
            AccountSelection selection
    ) {

        Long tenantId = requireTenantId();

        DateRangeResult dates =
                resolveDateRange(
                        dateRange,
                        from,
                        to
                );

        from = dates.from();
        to = dates.to();

        AccountingBasis accountingBasis =
                basis == null ? AccountingBasis.ACCRUAL : basis;

        BigDecimal totalRevenue =
                ledgerRepository.sumCreditByAccountType(
                        tenantId,
                        AccountType.INCOME,
                        associationId,
                        from,
                        to,
                        accountingBasis
                );

        BigDecimal totalExpenses =
                ledgerRepository.sumDebitByAccountType(
                        tenantId,
                        AccountType.EXPENSES,
                        associationId,
                        from,
                        to,
                        accountingBasis
                );

        BigDecimal netIncome =
                totalRevenue.subtract(totalExpenses);

        List<ReportLineItem> revenue = new ArrayList<>();
        List<ReportLineItem> expenses = new ArrayList<>();

        if (selection == null || selection == AccountSelection.ALL
                || selection == AccountSelection.INCOME_ONLY) {

            revenue = buildIncomeStatementLines(
                    tenantId,
                    associationId,
                    from,
                    to,
                    accountingBasis,
                    AccountType.INCOME
            );
        }

        if (selection == null || selection == AccountSelection.ALL
                || selection == AccountSelection.EXPENSE_ONLY) {

            expenses = buildIncomeStatementLines(
                    tenantId,
                    associationId,
                    from,
                    to,
                    accountingBasis,
                    AccountType.EXPENSES
            );
        }

        return new IncomeStatementResponse(
                from,
                to,
                accountingBasis.name(),
                totalRevenue,
                totalExpenses,
                netIncome,
                revenue,
                expenses
        );
    }

    @Override
    public TrialBalanceResponse getTrialBalance(
            Long associationId,
            ReportDateRange dateRange,
            LocalDate from,
            LocalDate to,
            AccountingBasis basis,
            AccountSelection selection
    ) {

        Long tenantId = requireTenantId();

        DateRangeResult dates =
                resolveDateRange(
                        dateRange,
                        from,
                        to
                );

        from = dates.from();
        to = dates.to();

        AccountingBasis accountingBasis =
                basis == null ? AccountingBasis.ACCRUAL : basis;

        List<Object[]> rows =
                ledgerRepository.sumDebitCreditByAccountDateRange(
                        tenantId,
                        associationId,
                        from,
                        to,
                        accountingBasis
                );

        if (rows.isEmpty()) {
            return new TrialBalanceResponse(
                    from,
                    to,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    true,
                    List.of()
            );
        }

        Set<Long> accountIds =
                rows.stream()
                        .map(r -> (Long) r[0])
                        .collect(Collectors.toSet());

        List<Coa> coaList =
                coaRepository.findByTenantIdAndIdInAndIsDeletedFalse(
                        tenantId,
                        accountIds
                );

        Map<Long, Coa> coaMap =
                coaList.stream()
                        .collect(Collectors.toMap(
                                Coa::getId,
                                Function.identity()
                        ));

        List<TrialBalanceRow> accounts =
                new ArrayList<>();

        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;

        for (Object[] row : rows) {

            Long accountId = (Long) row[0];

            BigDecimal debit =
                    row[1] == null
                            ? BigDecimal.ZERO
                            : (BigDecimal) row[1];

            BigDecimal credit =
                    row[2] == null
                            ? BigDecimal.ZERO
                            : (BigDecimal) row[2];

            Coa coa = coaMap.get(accountId);

            if (coa == null) {
                continue;
            }

            if (!includeTrialBalanceAccount(
                    coa.getAccountType(),
                    selection
            )) {
                continue;
            }

            BigDecimal balance;

            switch (coa.getAccountType()) {

                case ASSETS, EXPENSES ->
                        balance = debit.subtract(credit);

                case LIABILITIES, EQUITY, INCOME ->
                        balance = credit.subtract(debit);

                default ->
                        balance = BigDecimal.ZERO;
            }

            accounts.add(
                    new TrialBalanceRow(
                            coa.getAccountCode(),
                            coa.getAccountName(),
                            coa.getAccountType().name(),
                            debit,
                            credit,
                            balance
                    )
            );

            totalDebits = totalDebits.add(debit);
            totalCredits = totalCredits.add(credit);
        }

        boolean balanced =
                totalDebits.compareTo(totalCredits) == 0;

        return new TrialBalanceResponse(
                from,
                to,
                totalDebits,
                totalCredits,
                balanced,
                accounts
        );
    }

    private Long requireTenantId() {

        Long tenantId = TenantContext.get();

        if (tenantId == null) {
            throw new IllegalStateException(
                    "Tenant context not found"
            );
        }

        return tenantId;
    }

    private List<ReportLineItem> buildIncomeStatementLines(
            Long tenantId,
            Long associationId,
            LocalDate from,
            LocalDate to,
            AccountingBasis basis,
            AccountType accountType
    ) {

        List<Object[]> rows =
                ledgerRepository.sumByAccountTypeGrouped(
                        tenantId,
                        accountType,
                        associationId,
                        from,
                        to,
                        basis
                );

        if (rows.isEmpty()) {
            return List.of();
        }

        Set<Long> accountIds =
                rows.stream()
                        .map(r -> (Long) r[0])
                        .collect(Collectors.toSet());

        Map<Long, Coa> coaMap =
                coaRepository
                        .findByTenantIdAndIdInAndIsDeletedFalse(
                                tenantId,
                                accountIds
                        )
                        .stream()
                        .collect(Collectors.toMap(
                                Coa::getId,
                                Function.identity()
                        ));

        List<ReportLineItem> result =
                new ArrayList<>();

        for (Object[] row : rows) {

            Long accountId = (Long) row[0];

            BigDecimal debit =
                    row[1] == null
                            ? BigDecimal.ZERO
                            : (BigDecimal) row[1];

            BigDecimal credit =
                    row[2] == null
                            ? BigDecimal.ZERO
                            : (BigDecimal) row[2];

            Coa coa = coaMap.get(accountId);

            if (coa == null) {
                continue;
            }

            BigDecimal balance;

            if (accountType == AccountType.INCOME) {
                balance = credit.subtract(debit);
            } else {
                balance = debit.subtract(credit);
            }

            result.add(
                    new ReportLineItem(
                            coa.getAccountCode(),
                            coa.getAccountName(),
                            balance
                    )
            );
        }

        return result;
    }

    private DateRangeResult resolveDateRange(
            ReportDateRange range,
            LocalDate from,
            LocalDate to
    ) {

        if (range == null || range == ReportDateRange.CUSTOM) {

            // If both dates provided → use them as-is
            if (from != null && to != null) {
                return new DateRangeResult(from, to);
            }

            // If only from provided → to = today
            if (from != null) {
                return new DateRangeResult(from, LocalDate.now());
            }

            // If only to provided → from = Jan 1 of that year
            if (to != null) {
                return new DateRangeResult(to.withDayOfYear(1), to);
            }

            // Nothing provided → default to THIS_YEAR
            LocalDate today = LocalDate.now();
            return new DateRangeResult(today.withDayOfYear(1), today);
        }

        LocalDate today = LocalDate.now();

        switch (range) {

            case THIS_YEAR:

                return new DateRangeResult(
                        today.withDayOfYear(1),
                        today
                );

            case LAST_YEAR:

                return new DateRangeResult(
                        LocalDate.of(
                                today.getYear() - 1,
                                1,
                                1
                        ),
                        LocalDate.of(
                                today.getYear() - 1,
                                12,
                                31
                        )
                );

            case THIS_QUARTER: {

                int quarter =
                        ((today.getMonthValue() - 1) / 3);

                LocalDate start =
                        LocalDate.of(
                                today.getYear(),
                                quarter * 3 + 1,
                                1
                        );

                return new DateRangeResult(
                        start,
                        today
                );
            }

            case LAST_QUARTER: {

                LocalDate lastQuarterDate =
                        today.minusMonths(3);

                int quarter =
                        ((lastQuarterDate.getMonthValue() - 1) / 3);

                LocalDate start =
                        LocalDate.of(
                                lastQuarterDate.getYear(),
                                quarter * 3 + 1,
                                1
                        );

                LocalDate end =
                        start.plusMonths(3).minusDays(1);

                return new DateRangeResult(
                        start,
                        end
                );
            }

            default:
                return new DateRangeResult(from, to);
        }
    }

    private boolean includeTrialBalanceAccount(
            AccountType accountType,
            AccountSelection selection
    ) {

        if (selection == null || selection == AccountSelection.ALL) {
            return true;
        }

        if (selection == AccountSelection.INCOME_ONLY) {
            return accountType == AccountType.INCOME;
        }

        if (selection == AccountSelection.EXPENSE_ONLY) {
            return accountType == AccountType.EXPENSES;
        }

        return true;
    }

    @Override
    public VendorLedgerResponse getVendorLedger(
            Long associationId,
            Long vendorId,
            ReportDateRange dateRange,
            LocalDate from,
            LocalDate to
    ) {
        Long tenantId = requireTenantId();

        // ── 1. Resolve dates ──────────────────────────────────────────────────
        DateRangeResult dates = resolveDateRange(dateRange, from, to);
        from = dates.from();
        to   = dates.to();

        // ── 2. Opening balances (unpaid before from-date) ─────────────────────
        Map<Long, BigDecimal> openingBalanceMap = new HashMap<>();
        if (from != null) {
            billRepository
                    .findOpeningBalancesByVendor(tenantId, associationId, vendorId, from)
                    .forEach(row -> openingBalanceMap.put(
                            (Long) row[0],
                            (BigDecimal) row[1]
                    ));
        }

        // ── 3. Bills in date range ────────────────────────────────────────────
        List<Bill> bills = billRepository.findForVendorLedger(
                tenantId, associationId, vendorId, from, to);

        // ── 4. Group bills by vendorId (LinkedHashMap preserves order) ────────
        Map<Long, List<Bill>> billsByVendor = bills.stream()
                .collect(Collectors.groupingBy(
                        Bill::getVendorId,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        // ── 5. Collect all vendorIds (LinkedHashSet preserves order) ──────────
        Set<Long> allVendorIds = new LinkedHashSet<>();
        allVendorIds.addAll(openingBalanceMap.keySet());
        allVendorIds.addAll(billsByVendor.keySet());

        if (allVendorIds.isEmpty()) {
            return new VendorLedgerResponse(from, to, List.of());
        }

        // ── 6. Load vendors — tenant-safe, single DB call ─────────────────────
        Map<Long, Vendor> vendorMap = vendorRepository
                .findByTenantIdAndIdIn(tenantId, allVendorIds)
                .stream()
                .collect(Collectors.toMap(Vendor::getId, Function.identity()));

        // ── 7. Build groups ───────────────────────────────────────────────────
        List<VendorLedgerGroup> groups = new ArrayList<>();

        for (Long vid : allVendorIds) {

            Vendor vendor = vendorMap.get(vid);
            if (vendor == null) continue;

            BigDecimal openingBalance =
                    openingBalanceMap.getOrDefault(vid, BigDecimal.ZERO);

            List<Bill> vendorBills =
                    billsByVendor.getOrDefault(vid, List.of());

            // Build transaction rows
            List<VendorLedgerRow> transactions = new ArrayList<>();
            BigDecimal runningBalance = openingBalance;
            BigDecimal totalBilled    = BigDecimal.ZERO;
            BigDecimal totalPaid      = BigDecimal.ZERO;

            for (Bill bill : vendorBills) {

                BigDecimal amount = bill.getTotalAmount();

                // Bill row — increases balance
                runningBalance = runningBalance.add(amount);
                totalBilled    = totalBilled.add(amount);

                transactions.add(new VendorLedgerRow(
                        bill.getIssueDate(),
                        bill.getBillNumber(),
                        bill.getMemo() != null ? bill.getMemo() : "-",
                        amount,
                        bill.getStatus().name(),
                        runningBalance
                ));

                // Payment row — decreases balance
                if (bill.getStatus() == BillStatus.PAID) {

                    runningBalance = runningBalance.subtract(amount);
                    totalPaid      = totalPaid.add(amount);

                    LocalDate paidDate = bill.getPaidAt() != null
                            ? bill.getPaidAt()
                            .atZone(java.time.ZoneId.systemDefault()) // ← systemDefault is JVM timezone
                            .toLocalDate()
                            : bill.getIssueDate();

                    transactions.add(new VendorLedgerRow(
                            paidDate,
                            bill.getBillNumber(),
                            "Payment - " + bill.getBillNumber(),
                            amount.negate(),
                            BillStatus.PAID.name(),
                            runningBalance
                    ));
                }
            }

            BigDecimal closingBalance = openingBalance
                    .add(totalBilled)
                    .subtract(totalPaid);

            String vendorName = vendor.getFirstName() + " " + vendor.getLastName()
                    + (vendor.getCompanyName() != null
                    ? " (" + vendor.getCompanyName() + ")" : "");

            groups.add(new VendorLedgerGroup(
                    vid,
                    vendorName,
                    vendor.getServiceCategory(),
                    openingBalance,
                    totalBilled,
                    totalPaid,
                    closingBalance,
                    transactions
            ));
        }

        // Sort by vendor name for consistent output
        groups.sort(Comparator.comparing(VendorLedgerGroup::vendorName));

        return new VendorLedgerResponse(from, to, groups);
    }

    @Override
    public BudgetVsActualResponse getBudgetVsActual(
            Long budgetId,
            Long associationId,
            AccountingBasis accountingBasis,
            ReportDateRange dateRange,
            LocalDate from,
            LocalDate to
    ) {
        Long tenantId = requireTenantId();

        // ── 1. Load budget — tenant-safe ──────────────────────────────────────
        Budget budget = budgetRepository
                .findByIdAndTenantId(budgetId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Budget not found: " + budgetId));

        // ── 2. Resolve date range ─────────────────────────────────────────────
        //       Fall back to budget's own fiscal dates if no range provided
        DateRangeResult dates = resolveDateRange(dateRange, from, to);
        LocalDate effectiveFrom = dates.from() != null
                ? dates.from() : budget.getStartDate();
        LocalDate effectiveTo   = dates.to()   != null
                ? dates.to()   : budget.getEndDate();

        AccountingBasis basis = accountingBasis != null
                ? accountingBasis : AccountingBasis.ACCRUAL;

        // ── 3. Get budget line items ──────────────────────────────────────────
        List<BudgetLineItem> lineItems = budget.getLineItems();

        if (lineItems.isEmpty()) {
            return new BudgetVsActualResponse(
                    budget.getName(),
                    effectiveFrom,
                    effectiveTo,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    List.of()
            );
        }

        // ── 4. Load CoA for all accounts in line items — single DB call ───────
        Set<Long> accountIds = lineItems.stream()
                .map(BudgetLineItem::getAccountId)
                .collect(Collectors.toSet());

        Map<Long, Coa> coaMap = coaRepository
                .findByTenantIdAndIdInAndIsDeletedFalse(tenantId, accountIds)
                .stream()
                .collect(Collectors.toMap(Coa::getId, Function.identity()));

        // ── 5. Load actual ledger amounts — single DB call ────────────────────
        //       Returns [accountId, totalDebit, totalCredit] per account
        List<Object[]> ledgerRows = ledgerRepository
                .sumDebitCreditByAccountDateRange(
                        tenantId,
                        associationId,
                        effectiveFrom,
                        effectiveTo,
                        basis
                );

        // Map accountId → net actual amount (sign-corrected per account type)
        Map<Long, BigDecimal> actualByAccount = new HashMap<>();

        for (Object[] row : ledgerRows) {
            Long   accountId = (Long)       row[0];
            BigDecimal debit  = row[1] == null ? BigDecimal.ZERO : (BigDecimal) row[1];
            BigDecimal credit = row[2] == null ? BigDecimal.ZERO : (BigDecimal) row[2];

            Coa coa = coaMap.get(accountId);
            if (coa == null) continue;

            // Apply same sign convention as Income Statement:
            // INCOME  → credit - debit (net credit = revenue)
            // EXPENSES → debit - credit (net debit = cost)
            // ASSETS/LIABILITIES/EQUITY → debit - credit (balance sheet normal)
            BigDecimal netAmount = switch (coa.getAccountType()) {
                case INCOME     -> credit.subtract(debit);
                case EXPENSES   -> debit.subtract(credit);
                case ASSETS     -> debit.subtract(credit);
                case LIABILITIES, EQUITY -> credit.subtract(debit);
            };

            actualByAccount.put(accountId, netAmount);
        }

        // ── 6. Build rows ─────────────────────────────────────────────────────
        List<BudgetVsActualRow> rows = new ArrayList<>();
        BigDecimal totalBudgeted = BigDecimal.ZERO;
        BigDecimal totalActual   = BigDecimal.ZERO;

        for (BudgetLineItem item : lineItems) {

            Coa coa = coaMap.get(item.getAccountId());
            if (coa == null) continue;

            BigDecimal budgeted = item.getBudgetedAmount() != null
                    ? item.getBudgetedAmount() : BigDecimal.ZERO;

            BigDecimal actual = actualByAccount
                    .getOrDefault(item.getAccountId(), BigDecimal.ZERO);

            // variance = budgeted - actual
            // INCOME:   positive = actual exceeded budget (good)
            // EXPENSES: positive = under budget (good)
            BigDecimal variance = budgeted.subtract(actual);

            // variancePercentage = variance / budgeted * 100
            // Guard against divide-by-zero when budgeted = 0
            BigDecimal variancePct = BigDecimal.ZERO;
            if (budgeted.compareTo(BigDecimal.ZERO) != 0) {
                variancePct = variance
                        .divide(budgeted, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
            }

            rows.add(new BudgetVsActualRow(
                    coa.getAccountCode(),
                    coa.getAccountName(),
                    coa.getAccountType().name(),
                    budgeted,
                    actual,
                    variance,
                    variancePct
            ));

            totalBudgeted = totalBudgeted.add(budgeted);
            totalActual   = totalActual.add(actual);
        }

        BigDecimal totalVariance = totalBudgeted.subtract(totalActual);

        // Sort: INCOME first, then EXPENSES, then others — matches P&L layout
        rows.sort(Comparator.comparing(BudgetVsActualRow::accountType)
                .reversed()
                .thenComparing(BudgetVsActualRow::accountCode));

        return new BudgetVsActualResponse(
                budget.getName(),
                effectiveFrom,
                effectiveTo,
                totalBudgeted,
                totalActual,
                totalVariance,
                rows
        );
    }
}