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
import com.gstech.saas.accounting.reports.dto.*;
import com.gstech.saas.accounting.reports.repository.ReportsRepository;
import com.gstech.saas.associations.vendor.model.Vendor;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportsService {

    private final ReportsRepository reportsRepository;
    private final BillRepository    billRepository;
    private final BudgetRepository  budgetRepository;
    private final CoaRepository     coaRepository;
    private final VendorRepository  vendorRepository;

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    @Transactional(readOnly = true)
    public BalanceSheetResponse generateBalanceSheet(Long associationId,
                                                     LocalDate asOfDate,
                                                     AccountingBasis basis) {
        Long tenantId       = TenantContext.get();
        LocalDate reportDate   = asOfDate != null ? asOfDate : LocalDate.now();
        AccountingBasis reportBasis = basis != null ? basis : AccountingBasis.ACCRUAL;

        List<ReportLineItem> assets      = fetchLineItems(tenantId, associationId, reportDate, AccountType.ASSETS,      true,  reportBasis);
        List<ReportLineItem> liabilities = fetchLineItems(tenantId, associationId, reportDate, AccountType.LIABILITIES, false, reportBasis);
        List<ReportLineItem> equity      = fetchLineItems(tenantId, associationId, reportDate, AccountType.EQUITY,      false, reportBasis);

        BigDecimal totalAssets      = sum(assets);
        BigDecimal totalLiabilities = sum(liabilities);
        BigDecimal totalEquity      = sum(equity);
        BigDecimal liabPlusEquity   = totalLiabilities.add(totalEquity);
        boolean    isBalanced       = totalAssets.compareTo(liabPlusEquity) == 0;

        if (!isBalanced) {
            log.warn("Balance sheet NOT balanced: tenantId={}, associationId={}, date={}. Assets={}, Liab+Eq={}",
                    tenantId, associationId, reportDate, totalAssets, liabPlusEquity);
        }

        return new BalanceSheetResponse(reportDate, reportBasis.name(),
                assets, liabilities, equity,
                totalAssets, totalLiabilities, totalEquity, isBalanced);
    }

    @Transactional(readOnly = true)
    public IncomeStatementResponse generateIncomeStatement(Long associationId,
                                                           LocalDate from,
                                                           LocalDate to,
                                                           AccountingBasis basis,
                                                           AccountSelectionType selection) {
        Long tenantId          = TenantContext.get();
        LocalDate reportFrom   = from  != null ? from  : LocalDate.now().withDayOfYear(1);
        LocalDate reportTo     = to    != null ? to    : LocalDate.now();
        AccountingBasis reportBasis = basis != null ? basis : AccountingBasis.ACCRUAL;
        AccountSelectionType sel    = selection != null ? selection : AccountSelectionType.ALL;

        List<ReportLineItem> revenue  = List.of();
        List<ReportLineItem> expenses = List.of();

        if (sel == AccountSelectionType.ALL || sel == AccountSelectionType.INCOME_ONLY) {
            revenue = fetchIncomeStatementLineItems(tenantId, associationId, reportFrom, reportTo,
                    AccountType.INCOME, false /* credit-normal */, reportBasis);
        }
        if (sel == AccountSelectionType.ALL || sel == AccountSelectionType.EXPENSE_ONLY) {
            expenses = fetchIncomeStatementLineItems(tenantId, associationId, reportFrom, reportTo,
                    AccountType.EXPENSES, true /* debit-normal */, reportBasis);
        }

        BigDecimal totalRevenue  = sum(revenue);
        BigDecimal totalExpenses = sum(expenses);

        return new IncomeStatementResponse(reportFrom, reportTo, reportBasis.name(),
                totalRevenue, totalExpenses, totalRevenue.subtract(totalExpenses),
                revenue, expenses);
    }

    @Transactional(readOnly = true)
    public TrialBalanceResponse generateTrialBalance(Long associationId,
                                                     LocalDate from,
                                                     LocalDate to,
                                                     AccountingBasis basis,
                                                     Long accountId) {
        Long tenantId          = TenantContext.get();
        LocalDate reportFrom   = from != null ? from : LocalDate.now().withDayOfYear(1);
        LocalDate reportTo     = to   != null ? to   : LocalDate.now();
        AccountingBasis reportBasis = basis != null ? basis : AccountingBasis.ACCRUAL;

        List<TrialBalanceRow> accounts;
        if (accountId != null) {
            accounts = reportsRepository
                    .getTrialBalanceAccount(tenantId, associationId, accountId, reportFrom, reportTo, reportBasis)
                    .stream().map(this::mapToTrialBalanceRow).toList();
        } else {
            accounts = reportsRepository
                    .getTrialBalanceAccounts(tenantId, associationId, reportFrom, reportTo, reportBasis)
                    .stream().map(this::mapToTrialBalanceRow).toList();
        }

        BigDecimal totalDebits  = accounts.stream().map(TrialBalanceRow::totalDebit).reduce(ZERO, BigDecimal::add);
        BigDecimal totalCredits = accounts.stream().map(TrialBalanceRow::totalCredit).reduce(ZERO, BigDecimal::add);
        boolean    isBalanced   = totalDebits.compareTo(totalCredits) == 0;

        if (!isBalanced) {
            log.warn("Trial balance NOT balanced: tenantId={}, debits={}, credits={}",
                    tenantId, totalDebits, totalCredits);
        }

        return new TrialBalanceResponse(reportFrom, reportTo, reportBasis.name(),
                totalDebits, totalCredits, isBalanced, accounts);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Bucket classification by AccountType
    //   INCOME    → Operating  (credit - debit = revenue inflow, positive)
    //   EXPENSES  → Operating  (debit - credit = cash out, negative)
    //   ASSETS    → Investing  (credit - debit)
    //   LIABILITIES, EQUITY → Financing (credit - debit)
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CashFlowResponse generateCashFlow(Long associationId,
                                             LocalDate from,
                                             LocalDate to,
                                             AccountingBasis basis) {
        Long tenantId        = TenantContext.get();
        LocalDate reportFrom = from != null ? from : LocalDate.now().withDayOfYear(1);
        LocalDate reportTo   = to   != null ? to   : LocalDate.now();
        AccountingBasis reportBasis = basis != null ? basis : AccountingBasis.ACCRUAL;

        List<Object[]> rows = reportsRepository.getAllAccountsForCashFlow(
                tenantId, associationId, reportFrom, reportTo, reportBasis);

        List<CashFlowRow> operating = new ArrayList<>();
        List<CashFlowRow> investing  = new ArrayList<>();
        List<CashFlowRow> financing  = new ArrayList<>();

        for (Object[] row : rows) {
            String      accountName = (String)      row[2];
            AccountType type        = (AccountType) row[3];
            BigDecimal  debit       = safe(row[4]);
            BigDecimal  credit      = safe(row[5]);

            BigDecimal amount;
            List<CashFlowRow> bucket;

            switch (type) {
                case INCOME -> {
                    amount = credit.subtract(debit);           // revenue = inflow = positive
                    bucket = operating;
                }
                case EXPENSES -> {
                    amount = debit.subtract(credit).negate();  // expense = outflow = negative
                    bucket = operating;
                }
                case ASSETS -> {
                    amount = credit.subtract(debit);
                    bucket = investing;
                }
                case LIABILITIES, EQUITY -> {
                    amount = credit.subtract(debit);
                    bucket = financing;
                }
                default -> { continue; }
            }

            if (amount.compareTo(ZERO) != 0) {
                bucket.add(new CashFlowRow(accountName, amount));
            }
        }

        BigDecimal netOperating = sumCash(operating);
        BigDecimal netInvesting  = sumCash(investing);
        BigDecimal netFinancing  = sumCash(financing);
        BigDecimal netChange     = netOperating.add(netInvesting).add(netFinancing);

        // Opening cash = sum of all ASSETS balances before the period start
        BigDecimal openingCash = computeOpeningCash(tenantId, associationId, reportFrom);
        BigDecimal closingCash = openingCash.add(netChange);

        return new CashFlowResponse(reportFrom, reportTo, reportBasis.name(),
                netOperating, netInvesting, netFinancing,
                netChange, openingCash, closingCash,
                operating, investing, financing);
    }

    @Transactional(readOnly = true)
    public VendorLedgerResponse generateVendorLedger(Long associationId,
                                                     Long vendorId,
                                                     LocalDate from,
                                                     LocalDate to) {
        Long tenantId        = TenantContext.get();
        LocalDate reportFrom = from != null ? from : LocalDate.now().withDayOfYear(1);
        LocalDate reportTo   = to   != null ? to   : LocalDate.now();

        List<Bill> bills = billRepository.findBillsForVendorLedger(
                tenantId, reportFrom, reportTo, vendorId, associationId);

        if (bills.isEmpty()) {
            return new VendorLedgerResponse(reportFrom, reportTo, List.of());
        }

        // Batch-load all vendors — no N+1
        Set<Long> vendorIds = bills.stream()
                .map(Bill::getVendorId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, Vendor> vendorMap = vendorRepository.findAllById(vendorIds)
                .stream().collect(Collectors.toMap(Vendor::getId, Function.identity()));

        Map<Long, List<Bill>> byVendor = bills.stream()
                .filter(b -> b.getVendorId() != null)
                .collect(Collectors.groupingBy(Bill::getVendorId));

        List<VendorLedgerGroup> groups = byVendor.entrySet().stream()
                .map(e -> buildVendorGroup(e.getKey(), e.getValue(), vendorMap))
                .sorted(Comparator.comparing(VendorLedgerGroup::vendorName))
                .toList();

        return new VendorLedgerResponse(reportFrom, reportTo, groups);
    }

    private VendorLedgerGroup buildVendorGroup(Long vId, List<Bill> bills,
                                               Map<Long, Vendor> vendorMap) {
        Vendor vendor   = vendorMap.get(vId);
        // Always use companyName — NOT firstName+lastName (that is the contact person)
        String name     = vendor != null ? vendor.getCompanyName() : "Unknown";
        String category = vendor != null ? vendor.getServiceCategory() : "—";

        List<VendorLedgerRow> rows = new ArrayList<>();
        BigDecimal running      = ZERO;
        BigDecimal totalBilled  = ZERO;
        BigDecimal totalPaid    = ZERO;

        for (Bill bill : bills) {   // already sorted ASC from repository
            running     = running.add(bill.getTotalAmount());
            totalBilled = totalBilled.add(bill.getTotalAmount());
            if (bill.getStatus() == BillStatus.PAID) {
                totalPaid = totalPaid.add(bill.getTotalAmount());
            }
            rows.add(new VendorLedgerRow(
                    bill.getIssueDate(), bill.getBillNumber(),
                    bill.getMemo() != null ? bill.getMemo() : "",
                    bill.getTotalAmount(), bill.getStatus().name(), running));
        }

        return new VendorLedgerGroup(vId, name, category,
                totalBilled, totalPaid, totalBilled.subtract(totalPaid), rows);
    }

    @Transactional(readOnly = true)
    public BudgetVsActualResponse generateBudgetVsActual(Long budgetId,
                                                         AccountingBasis basis,
                                                         LocalDate from,
                                                         LocalDate to) {
        if (budgetId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "budgetId is required for the Budget vs Actual report");
        }

        Long tenantId          = TenantContext.get();
        AccountingBasis reportBasis = basis != null ? basis : AccountingBasis.ACCRUAL;

        Budget budget = budgetRepository
                .findByIdAndTenantIdWithLineItems(budgetId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Budget not found: " + budgetId));

        // Default to budget's own period when no date range provided
        LocalDate reportFrom = from != null ? from : budget.getStartDate();
        LocalDate reportTo   = to   != null ? to   : budget.getEndDate();

        // All line item account IDs
        Set<Long> accountIds = budget.getLineItems().stream()
                .map(BudgetLineItem::getAccountId).collect(Collectors.toSet());

        // Batch-load CoA
        Map<Long, Coa> coaMap = coaRepository
                .findByTenantIdAndIdInAndIsDeletedFalse(tenantId, accountIds)
                .stream().collect(Collectors.toMap(Coa::getId, Function.identity()));

        // Actual amounts per account in the period
        List<Object[]> actualRows = reportsRepository.getActualAmountsForAccounts(
                tenantId, accountIds, budget.getAssociationId(), reportFrom, reportTo, reportBasis);
        Map<Long, BigDecimal[]> actualMap = new HashMap<>();
        for (Object[] row : actualRows) {
            actualMap.put((Long) row[0], new BigDecimal[]{ safe(row[1]), safe(row[2]) });
        }

        List<BudgetVsActualRow> incomeRows  = new ArrayList<>();
        List<BudgetVsActualRow> expenseRows = new ArrayList<>();

        for (BudgetLineItem li : budget.getLineItems()) {
            Coa coa = coaMap.get(li.getAccountId());
            if (coa == null) continue;

            BigDecimal[] actuals = actualMap.getOrDefault(li.getAccountId(), new BigDecimal[]{ZERO, ZERO});
            BigDecimal actualAmt = switch (coa.getAccountType()) {
                case ASSETS, EXPENSES            -> actuals[0].subtract(actuals[1]);
                case LIABILITIES, EQUITY, INCOME -> actuals[1].subtract(actuals[0]);
            };

            BigDecimal budgeted   = li.getBudgetedAmount();
            BigDecimal variance   = budgeted.subtract(actualAmt);
            BigDecimal variantPct = budgeted.compareTo(ZERO) == 0 ? ZERO
                    : variance.divide(budgeted, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            BudgetVsActualRow row = new BudgetVsActualRow(
                    coa.getAccountCode(), coa.getAccountName(), coa.getAccountType().name(),
                    budgeted, actualAmt, variance, variantPct);

            if (coa.getAccountType() == AccountType.INCOME) {
                incomeRows.add(row);
            } else {
                expenseRows.add(row);
            }
        }

        incomeRows.sort(Comparator.comparing(BudgetVsActualRow::accountCode));
        expenseRows.sort(Comparator.comparing(BudgetVsActualRow::accountCode));

        BigDecimal totalBudgetedIncome   = incomeRows.stream().map(BudgetVsActualRow::budgetedAmount).reduce(ZERO, BigDecimal::add);
        BigDecimal totalActualIncome     = incomeRows.stream().map(BudgetVsActualRow::actualAmount).reduce(ZERO, BigDecimal::add);
        BigDecimal totalBudgetedExpenses = expenseRows.stream().map(BudgetVsActualRow::budgetedAmount).reduce(ZERO, BigDecimal::add);
        BigDecimal totalActualExpenses   = expenseRows.stream().map(BudgetVsActualRow::actualAmount).reduce(ZERO, BigDecimal::add);

        return new BudgetVsActualResponse(
                budget.getName(), reportFrom, reportTo, reportBasis.name(),
                totalBudgetedIncome, totalActualIncome,
                totalBudgetedExpenses, totalActualExpenses,
                totalBudgetedIncome.subtract(totalBudgetedExpenses),
                totalActualIncome.subtract(totalActualExpenses),
                incomeRows, expenseRows);
    }

    private List<ReportLineItem> fetchLineItems(Long tenantId, Long associationId,
                                                LocalDate asOfDate, AccountType accountType,
                                                boolean debitNormal, AccountingBasis basis) {
        return reportsRepository.getAccountBalances(tenantId, accountType, associationId, asOfDate, basis)
                .stream().map(row -> {
                    BigDecimal bal = debitNormal
                            ? safe(row[3]).subtract(safe(row[4]))
                            : safe(row[4]).subtract(safe(row[3]));
                    return new ReportLineItem((String) row[1], (String) row[2], bal);
                })
                .filter(i -> i.balance().compareTo(ZERO) != 0)
                .toList();
    }

    private List<ReportLineItem> fetchIncomeStatementLineItems(Long tenantId, Long associationId,
                                                               LocalDate from, LocalDate to,
                                                               AccountType accountType,
                                                               boolean debitNormal, AccountingBasis basis) {
        return reportsRepository.getIncomeStatementAccounts(tenantId, accountType, associationId, from, to, basis)
                .stream().map(row -> {
                    BigDecimal bal = debitNormal
                            ? safe(row[3]).subtract(safe(row[4]))
                            : safe(row[4]).subtract(safe(row[3]));
                    return new ReportLineItem((String) row[1], (String) row[2], bal);
                })
                .filter(i -> i.balance().compareTo(ZERO) != 0)
                .toList();
    }

    private TrialBalanceRow mapToTrialBalanceRow(Object[] row) {
        String     accountCode = (String)      row[1];
        String     accountName = (String)      row[2];
        AccountType type       = (AccountType) row[3];
        BigDecimal debit       = safe(row[4]);
        BigDecimal credit      = safe(row[5]);
        BigDecimal balance = (type == AccountType.ASSETS || type == AccountType.EXPENSES)
                ? debit.subtract(credit) : credit.subtract(debit);
        return new TrialBalanceRow(accountCode, accountName, type.name(), debit, credit, balance);
    }

    private BigDecimal computeOpeningCash(Long tenantId, Long associationId, LocalDate from) {
        return reportsRepository.getAssetBalancesBeforeDate(tenantId, associationId, from)
                .stream()
                .map(r -> safe(r[1]).subtract(safe(r[2])))
                .reduce(ZERO, BigDecimal::add);
    }

    private BigDecimal safe(Object v) {
        return (v instanceof BigDecimal bd) ? bd : ZERO;
    }

    private BigDecimal sum(List<ReportLineItem> items) {
        return items.stream().map(ReportLineItem::balance).reduce(ZERO, BigDecimal::add);
    }

    private BigDecimal sumCash(List<CashFlowRow> rows) {
        return rows.stream().map(CashFlowRow::amount).reduce(ZERO, BigDecimal::add);
    }
}