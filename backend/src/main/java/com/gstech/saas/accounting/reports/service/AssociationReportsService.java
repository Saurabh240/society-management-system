package com.gstech.saas.accounting.reports.service;

import com.gstech.saas.accounting.bills.model.Bill;
import com.gstech.saas.accounting.bills.model.BillStatus;
import com.gstech.saas.accounting.bills.repository.BillRepository;
import com.gstech.saas.accounting.invoice.model.InvoiceStatus;
import com.gstech.saas.accounting.invoice.model.Invoice;
import com.gstech.saas.accounting.invoice.repository.InvoiceRepository;
import com.gstech.saas.accounting.ledger.repository.LedgerRepository;
import com.gstech.saas.accounting.reports.dto.*;
import com.gstech.saas.associations.association.repository.AssociationRepository;
import com.gstech.saas.associations.owner.repository.OwnerRepository;
import com.gstech.saas.associations.unit.model.Unit;
import com.gstech.saas.associations.unit.repository.UnitRepository;
import com.gstech.saas.associations.vendor.model.Vendor;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import static com.gstech.saas.accounting.invoice.model.InvoiceStatus.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class AssociationReportsService {

    private final BillRepository         billRepository;
    private final InvoiceRepository      invoiceRepository;
    private final LedgerRepository       ledgerRepository;
    private final UnitRepository         unitRepository;
    private final AssociationRepository  associationRepository;
    private final OwnerRepository        ownerRepository;
    private final VendorRepository       vendorRepository;

    // ─────────────────────────────────────────────────────────────────────────
// REPORT 1 — VENDOR SPENDING
// ─────────────────────────────────────────────────────────────────────────
    public VendorSpendingResponse getVendorSpending(
            Long associationId,
            LocalDate from,
            LocalDate to) {

        Long tenantId = TenantContext.get();

        // Fetch all bills in range for this tenant
        List<Bill> bills = billRepository
                .findBillsForVendorSpending(tenantId, from, to, associationId);

        // Group by vendorId
        Map<Long, List<Bill>> byVendor = bills.stream()
                .filter(b -> b.getVendorId() != null)
                .collect(Collectors.groupingBy(Bill::getVendorId));

        // ✅ 1 batch DB call for ALL vendors instead of 1 call per vendor in loop
        Set<Long> vendorIds = byVendor.keySet();
        Map<Long, Vendor> vendorMap = vendorRepository.findAllById(vendorIds)
                .stream()
                .collect(Collectors.toMap(Vendor::getId, v -> v));

        List<VendorSpendingRow> rows = byVendor.entrySet().stream()
                .map(entry -> {
                    Long vendorId = entry.getKey();
                    List<Bill> vendorBills = entry.getValue();

                    // ✅ map lookup — zero DB calls inside the loop
                    Vendor vendor          = vendorMap.get(vendorId);
                    String vendorName      = vendor != null ? vendor.getCompanyName()     : "Unknown";
                    String serviceCategory = vendor != null ? vendor.getServiceCategory() : "—";

                    BigDecimal totalBilled = vendorBills.stream()
                            .map(Bill::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal totalPaid = vendorBills.stream()
                            .filter(b -> b.getStatus() == BillStatus.PAID)
                            .map(Bill::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal outstanding = totalBilled.subtract(totalPaid);

                    return new VendorSpendingRow(
                            vendorId, vendorName, serviceCategory,
                            vendorBills.size(), totalBilled, totalPaid, outstanding);
                })
                .sorted(Comparator.comparing(VendorSpendingRow::totalBilled).reversed())
                .toList();

        BigDecimal totalSpent = rows.stream()
                .map(VendorSpendingRow::totalPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new VendorSpendingResponse(from, to, totalSpent, rows);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // REPORT 2 — ASSESSMENT HISTORY
    // ─────────────────────────────────────────────────────────────────────────
    public AssessmentHistoryResponse getAssessmentHistory(
            Long associationId,
            LocalDate from,
            LocalDate to) {

        Long tenantId = TenantContext.get();

        List<Invoice> invoices = invoiceRepository
                .findByTenantIdAndInvoiceDateBetweenAndAssociationId(
                        tenantId, from, to, associationId);

        List<AssessmentHistoryRow> rows = invoices.stream()
                .map(inv -> {
                    Unit unit = unitRepository.findById(inv.getUnitId()).orElse(null);
                    String unitNumber   = unit != null ? unit.getUnitNumber() : "—";
                    String assocName    = associationRepository
                            .findById(inv.getAssociationId())
                            .map(a -> a.getName()).orElse("—");
                    String ownerName    = ownerRepository
                            .findPrimaryOwnerByUnitId(inv.getUnitId())
                            .map(o -> o.getFirstName() + " " + o.getLastName())
                            .orElse("—");

                    InvoiceStatus status = resolveInvoiceStatus(inv);

                    return new AssessmentHistoryRow(
                            inv.getId(), assocName, unitNumber, ownerName,
                            inv.getInvoiceDate(), inv.getDueDate(),
                            inv.getTotalAmount(), status);
                })
                .sorted(Comparator.comparing(AssessmentHistoryRow::invoiceDate))
                .toList();

        BigDecimal totalAssessed  = rows.stream()
                .map(AssessmentHistoryRow::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCollected = rows.stream()
                .filter(r -> r.status() == InvoiceStatus.PAID)
                .map(AssessmentHistoryRow::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal collectionRate = totalAssessed.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : totalCollected.divide(totalAssessed, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return new AssessmentHistoryResponse(
                from, to, totalAssessed, totalCollected, collectionRate, rows);
    }

    private InvoiceStatus  resolveInvoiceStatus(Invoice inv) {
        if (inv.getStatus() == PAID) return PAID;
        if (inv.getDueDate().isBefore(LocalDate.now())) return OVERDUE;
        return UNPAID;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPORT 3 — UNIT OWNER STATEMENT
    // ─────────────────────────────────────────────────────────────────────────
    public UnitOwnerStatementResponse getUnitOwnerStatement(
            Long associationId,
            Long unitId,
            LocalDate from,
            LocalDate to) {

        Long tenantId = TenantContext.get();

        // Validate required params
        if (associationId == null || unitId == null) {
            throw new IllegalArgumentException(
                    "Both associationId and unitId are required for the owner statement");
        }

        Unit unit = unitRepository.findByIdAndTenantId(unitId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found: " + unitId));

// ✅ Validate unit actually belongs to the given associationId
        if (!unit.getAssociation().getId().equals(associationId)) {
            throw new IllegalArgumentException(
                    "Unit " + unitId + " does not belong to association " + associationId);
        }

        String assocName = associationRepository
                .findById(associationId).map(a -> a.getName()).orElse("—");

        String ownerName  = ownerRepository.findPrimaryOwnerByUnitId(unitId)
                .map(o -> o.getFirstName() + " " + o.getLastName()).orElse("—");
        String ownerEmail = ownerRepository.findPrimaryOwnerByUnitId(unitId)
                .map(o -> o.getEmail()).orElse("—");

        // Opening balance = currentBalance - chargesInPeriod + paymentsInPeriod
        BigDecimal chargesInPeriod  = invoiceRepository.sumTotalByUnitIdAndDateRange(unitId, from, to);
        BigDecimal paymentsInPeriod = ledgerRepository.sumCreditByAssociationAndDateRange(
                tenantId, associationId, from, to);
        BigDecimal openingBalance   = unit.getBalance()
                .subtract(chargesInPeriod)
                .add(paymentsInPeriod);

        // Charges = invoices in range
        List<Invoice> invoices = invoiceRepository
                .findByUnitIdAndTenantIdAndInvoiceDateBetween(unitId, tenantId, from, to);

        // Payments = ledger credit entries for this unit's association in range
        List<Object[]> payments = ledgerRepository
                .findCreditEntriesByAssociationAndDateRange(tenantId, associationId, from, to);

        // Merge + sort by date
        List<StatementRow> transactions = new ArrayList<>();
        BigDecimal running = openingBalance;

        // Add charges
        for (Invoice inv : invoices) {
            running = running.add(inv.getTotalAmount());
            transactions.add(new StatementRow(
                    inv.getInvoiceDate(),
                    "Invoice #" + inv.getId(),
                    "CHARGE",
                    inv.getTotalAmount(),
                    running));
        }

        // Add payments from ledger
        for (Object[] row : payments) {
            LocalDate date    = (LocalDate)    row[0];
            String desc       = (String)       row[1];
            BigDecimal amount = (BigDecimal)   row[2];

            running = running.subtract(amount);
            transactions.add(new StatementRow(date, desc, "PAYMENT", amount, running));
        }

        // Sort all by date ascending
        transactions.sort(Comparator.comparing(StatementRow::date));

        // Recompute running balance in sorted order
        List<StatementRow> sorted = new ArrayList<>();
        running = openingBalance;
        for (StatementRow tx : transactions) {
            running = "CHARGE".equals(tx.type())
                    ? running.add(tx.amount())
                    : running.subtract(tx.amount());
            sorted.add(new StatementRow(tx.date(), tx.description(), tx.type(), tx.amount(), running));
        }

        BigDecimal totalCharges  = invoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPayments = payments.stream()
                .map(r -> (BigDecimal) r[2])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal closingBalance = openingBalance.add(totalCharges).subtract(totalPayments);

        return new UnitOwnerStatementResponse(
                unitId, unit.getUnitNumber(), assocName, ownerName, ownerEmail,
                from, to, openingBalance, totalCharges, totalPayments, closingBalance, sorted);
    }

    public FinancialSummaryResponse getFinancialSummary(
            Long associationId,
            LocalDate from,
            LocalDate to) {

        Long tenantId = TenantContext.get();

        // Fetch revenue and expenses for the period
        BigDecimal totalRevenue = invoiceRepository.sumTotalByAssociationIdAndDateRange(
                tenantId, associationId, from, to);
        BigDecimal totalExpenses = billRepository.sumTotalByAssociationIdAndDateRange(
                tenantId, associationId, from, to);

        BigDecimal netIncome = totalRevenue.subtract(totalExpenses);

        // Fetch current balances (as of report date)
        BigDecimal totalAssets = ledgerRepository.sumDebitByAssociation(tenantId, associationId);
        BigDecimal totalLiabilities = ledgerRepository.sumCreditByAssociation(tenantId, associationId);
        BigDecimal totalEquity = totalAssets.subtract(totalLiabilities);

        // Outstanding charges = unpaid invoices
        BigDecimal outstandingCharges = invoiceRepository
                .sumTotalByAssociationIdAndStatusAndDateRange(
                        tenantId, associationId, InvoiceStatus.UNPAID, from, to);

        // Collection rate = collected / total assessed
        BigDecimal collectionRate = totalRevenue.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : totalRevenue.subtract(outstandingCharges)
                .divide(totalRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        List<FinancialSummaryRow> summary = List.of(
                new FinancialSummaryRow("Total Revenue", totalRevenue),
                new FinancialSummaryRow("Total Expenses", totalExpenses),
                new FinancialSummaryRow("Net Income", netIncome),
                new FinancialSummaryRow("Total Assets", totalAssets),
                new FinancialSummaryRow("Total Liabilities", totalLiabilities),
                new FinancialSummaryRow("Total Equity", totalEquity),
                new FinancialSummaryRow("Outstanding Charges", outstandingCharges),
                new FinancialSummaryRow("Collection Rate %", collectionRate)
        );

        return new FinancialSummaryResponse(
                from, to, totalRevenue, totalExpenses, netIncome,
                totalAssets, totalLiabilities, totalEquity,
                outstandingCharges, collectionRate, summary);
    }

    public UnitOccupancyResponse getUnitOccupancy(Long associationId) {

        Long tenantId = TenantContext.get();

        // Fetch all units for this association
        List<Unit> units = unitRepository.findByAssociationIdAndTenantId(associationId, tenantId);

        int totalUnits = units.size();
        int occupiedUnits = 0;
        List<UnitOccupancyRow> rows = new ArrayList<>();

        for (Unit unit : units) {
            boolean isOccupied = ownerRepository.findPrimaryOwnerByUnitId(unit.getId()).isPresent();
            occupiedUnits += isOccupied ? 1 : 0;

            String ownerName = ownerRepository.findPrimaryOwnerByUnitId(unit.getId())
                    .map(o -> o.getFirstName() + " " + o.getLastName()).orElse("—");
            String ownerEmail = ownerRepository.findPrimaryOwnerByUnitId(unit.getId())
                    .map(o -> o.getEmail()).orElse("—");

            String status = isOccupied ? "OCCUPIED" : "VACANT";

            rows.add(new UnitOccupancyRow(
                    unit.getId(),
                    unit.getUnitNumber(),
                    ownerName,
                    ownerEmail,
                    status));
        }

        int vacantUnits = totalUnits - occupiedUnits;
        double occupancyRate = totalUnits == 0 ? 0.0 : (double) occupiedUnits / totalUnits * 100;

        return new UnitOccupancyResponse(
                "CURRENT",
                totalUnits,
                occupiedUnits,
                vacantUnits,
                occupancyRate,
                rows);
    }

    public DelinquencyResponse getDelinquency(Long associationId, String agingPeriod) {

        Long tenantId = TenantContext.get();

        // Fetch all unpaid invoices for this association
        List<Invoice> unpaidInvoices = invoiceRepository
                .findByTenantIdAndAssociationIdAndStatus(tenantId, associationId, InvoiceStatus.UNPAID);

        LocalDate today = LocalDate.now();
        List<DelinquencyRow> delinquencies = new ArrayList<>();
        BigDecimal totalOutstanding = BigDecimal.ZERO;
        int delinquentCount = 0;

        for (Invoice invoice : unpaidInvoices) {
            int daysOverdue = (int) java.time.temporal.ChronoUnit.DAYS.between(invoice.getDueDate(), today);

            // Filter by aging period
            if ("ALL".equals(agingPeriod) || matchesAgingBucket(daysOverdue, agingPeriod)) {
                Unit unit = unitRepository.findById(invoice.getUnitId()).orElse(null);
                String unitNumber = unit != null ? unit.getUnitNumber() : "—";

                String ownerName = ownerRepository.findPrimaryOwnerByUnitId(invoice.getUnitId())
                        .map(o -> o.getFirstName() + " " + o.getLastName()).orElse("—");
                String ownerEmail = ownerRepository.findPrimaryOwnerByUnitId(invoice.getUnitId())
                        .map(o -> o.getEmail()).orElse("—");

                String agingBucket = getAgingBucket(daysOverdue);

                delinquencies.add(new DelinquencyRow(
                        invoice.getUnitId(),
                        unitNumber,
                        ownerName,
                        ownerEmail,
                        invoice.getTotalAmount(),
                        invoice.getDueDate(),
                        daysOverdue,
                        agingBucket));

                totalOutstanding = totalOutstanding.add(invoice.getTotalAmount());
                delinquentCount++;
            }
        }

        // Collection rate for tracking
        BigDecimal totalInvoiced = unpaidInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double delinquencyRate = totalInvoiced.compareTo(BigDecimal.ZERO) == 0
                ? 0.0
                : totalOutstanding.divide(totalInvoiced, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();

        delinquencies.sort(Comparator.comparing(DelinquencyRow::daysOverdue).reversed());

        return new DelinquencyResponse(
                agingPeriod,
                totalOutstanding,
                delinquentCount,
                delinquencyRate,
                delinquencies);
    }

    private boolean matchesAgingBucket(int daysOverdue, String period) {
        return switch (period) {
            case "0_30" -> daysOverdue <= 30;
            case "31_60" -> daysOverdue > 30 && daysOverdue <= 60;
            case "61_90" -> daysOverdue > 60 && daysOverdue <= 90;
            case "90_PLUS" -> daysOverdue > 90;
            default -> true;
        };
    }

    private String getAgingBucket(int daysOverdue) {
        if (daysOverdue <= 30) return "0-30 days";
        if (daysOverdue <= 60) return "31-60 days";
        if (daysOverdue <= 90) return "61-90 days";
        return "90+ days";
    }
}