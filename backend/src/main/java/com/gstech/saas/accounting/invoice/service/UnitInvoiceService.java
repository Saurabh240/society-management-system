package com.gstech.saas.accounting.invoice.service;

import com.gstech.saas.accounting.banking.model.Banking;
import com.gstech.saas.accounting.banking.repository.BankingRepository;
import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.invoice.dto.*;
import com.gstech.saas.accounting.invoice.model.Invoice;
import com.gstech.saas.accounting.invoice.model.InvoiceLineItem;
import com.gstech.saas.accounting.invoice.model.InvoiceStatus;
import com.gstech.saas.accounting.invoice.repository.InvoiceRepository;
import com.gstech.saas.accounting.journal.dto.CreateJournalRequest;
import com.gstech.saas.accounting.journal.dto.JournalLineRequest;
import com.gstech.saas.accounting.journal.service.JournalService;
import com.gstech.saas.accounting.ledger.dto.LedgerSourceType;
import com.gstech.saas.accounting.ledger.dto.LineBasis;
import com.gstech.saas.associations.unit.model.Unit;
import com.gstech.saas.associations.unit.repository.UnitRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class UnitInvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UnitRepository unitRepository;
    private final CoaRepository coaRepository;
    private final JournalService journalService;
    private final BankingRepository bankingRepository;
    private static final String AR_ACCOUNT_CODE = "1100";

    @Transactional
    public InvoiceResponse create(Long unitId, CreateInvoiceRequest request) {
        Long tenantId = TenantContext.get();

        Unit unit = unitRepository.findByIdAndTenantId(unitId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found: " + unitId));

        BigDecimal total = request.lineItems().stream()
                .map(InvoiceLineItemRequest::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invoice total must be greater than zero");
        }

        List<Coa> incomeAccounts = new ArrayList<>();
        for (InvoiceLineItemRequest item : request.lineItems()) {
            Coa account = coaRepository.findByIdAndTenantId(item.incomeAccountId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Account not found: " + item.incomeAccountId()));

            if (account.getAccountType() != AccountType.INCOME) {
                throw new IllegalArgumentException(
                        "Account '" + account.getAccountName() + "' must be type INCOME");
            }
            incomeAccounts.add(account);
        }


        Coa arAccount = resolveArAccount(tenantId);

        List<JournalLineRequest> lines = new ArrayList<>();

        lines.add(new JournalLineRequest(
                arAccount.getId(),
                "Invoice - Unit " + unit.getUnitNumber(),
                total,
                BigDecimal.ZERO,
                LedgerSourceType.INVOICE_CHARGE,
                LineBasis.ACCRUAL));

        for (int i = 0; i < request.lineItems().size(); i++) {
            InvoiceLineItemRequest item = request.lineItems().get(i);
            lines.add(new JournalLineRequest(
                    item.incomeAccountId(),
                    item.description(),
                    BigDecimal.ZERO,
                    item.amount(),
                    LedgerSourceType.INVOICE_CHARGE,
                    LineBasis.ACCRUAL));
        }

        journalService.create(new CreateJournalRequest(
                request.invoiceDate(),
                unit.getAssociation().getId(),
                "Invoice - Unit " + unit.getUnitNumber(),
                null,
                lines
        ));

        Invoice invoice = Invoice.builder()
                .unitId(unit.getId())
                .associationId(unit.getAssociation().getId())
                .invoiceDate(request.invoiceDate())
                .dueDate(request.dueDate())
                .totalAmount(total)
                .notes(request.notes())
                .build();

        List<InvoiceLineItem> lineItemEntities = new ArrayList<>();
        for (int i = 0; i < request.lineItems().size(); i++) {
            InvoiceLineItemRequest item = request.lineItems().get(i);
            lineItemEntities.add(InvoiceLineItem.builder()
                    .invoice(invoice)
                    .description(item.description())
                    .incomeAccountId(item.incomeAccountId())
                    .incomeAccountName(incomeAccounts.get(i).getAccountName())
                    .amount(item.amount())
                    .build());
        }
        invoice.setLineItems(lineItemEntities);

        Invoice saved = invoiceRepository.save(invoice);

        unit.setBalance(unit.getBalance().add(total));
        unitRepository.save(unit);

        log.info("Invoice created: id={}, unitId={}, total={}", saved.getId(), unitId, total);

        return toResponse(saved, unit.getUnitNumber());
    }

    /* ── AR account resolution ────────────────────────────────────────────── */

    private Coa resolveArAccount(Long tenantId) {
        return coaRepository
                .findByTenantIdAndAccountCodeAndIsDeletedFalse(tenantId, AR_ACCOUNT_CODE)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Accounts Receivable account (code " + AR_ACCOUNT_CODE + ") not found for tenant. "
                                + "Check Chart of Accounts setup."));
    }

    /* ── Receive Payment ──────────────────────────────────────────────────────
     * Was missing entirely in this release: the frontend's "Receive Payment"
     * modal (UnitLedgerPage.jsx) already posts here, but no backend route
     * existed, so every submission 404'd. Mirrors BillService.pay()'s
     * dual-basis approach: ACCRUAL clears the receivable immediately, CASH
     * recognizes income only now (prorated FIFO across outstanding invoices,
     * oldest first), BOTH records the cash hitting the bank.
     */

    @Transactional
    public RecordUnitPaymentResponse recordPayment(Long unitId, RecordUnitPaymentRequest request) {
        Long tenantId = TenantContext.get();

        Unit unit = unitRepository.findByIdAndTenantId(unitId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found: " + unitId));

        if (request.amount().compareTo(unit.getBalance()) > 0) {
            throw new IllegalArgumentException(
                    "Payment amount " + request.amount() + " exceeds outstanding balance " + unit.getBalance());
        }

        Banking bankAccount = bankingRepository.findByIdAndTenantId(request.bankAccountId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Bank account not found with id: " + request.bankAccountId()));

        Long cashCoaId = bankAccount.getCoaAccountId();
        if (cashCoaId == null) {
            // Same gap BankingServiceImpl.createAccount()/updateAccount() guard
            // against going forward - see BE fix notes. A bank account created
            // before that fix (and not yet re-saved) can still hit this.
            throw new EntityNotFoundException(
                    "Bank account '" + bankAccount.getBankAccountName() + "' has no linked GL account, so this "
                            + "payment can't be posted safely. Re-save the bank account (Edit -> Save) to link one, "
                            + "then try again.");
        }
        Coa cashAccount = coaRepository.findByIdAndTenantIdAndIsDeletedFalse(cashCoaId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Cash account not found: " + cashCoaId));

        Coa arAccount = resolveArAccount(tenantId);
        BigDecimal amount = request.amount();

        List<JournalLineRequest> lines = new ArrayList<>();

        // ACCRUAL: clears the receivable
        lines.add(new JournalLineRequest(
                arAccount.getId(),
                "Payment received - Unit " + unit.getUnitNumber(),
                BigDecimal.ZERO,
                amount,
                LedgerSourceType.PAYMENT_RECEIVED,
                LineBasis.ACCRUAL));

        // CASH: income recognized now, prorated FIFO across outstanding invoices
        lines.addAll(buildCashBasisIncomeLines(unit, tenantId, amount));

        // BOTH: cash arrives in the bank
        lines.add(new JournalLineRequest(
                cashAccount.getId(),
                "Payment received - Cash (" + bankAccount.getBankAccountName() + "): Unit " + unit.getUnitNumber(),
                amount,
                BigDecimal.ZERO,
                LedgerSourceType.PAYMENT_RECEIVED,
                LineBasis.BOTH));

        String memo = "Payment received - Unit " + unit.getUnitNumber()
                + (request.referenceNumber() != null && !request.referenceNumber().isBlank()
                        ? " (Ref: " + request.referenceNumber() + ")" : "");

        journalService.create(new CreateJournalRequest(
                request.paymentDate(),
                unit.getAssociation().getId(),
                memo,
                null,
                lines
        ));

        unit.setBalance(unit.getBalance().subtract(amount));
        unitRepository.save(unit);

        log.info("Payment recorded: unitId={}, amount={}, bankAccountId={}",
                unitId, amount, request.bankAccountId());

        return new RecordUnitPaymentResponse(unitId, amount, request.paymentDate(), unit.getBalance());
    }

    /**
     * Applies {@code paymentAmount} FIFO across the unit's outstanding invoices
     * (oldest invoiceDate first), prorating each invoice's own share across its
     * line items - same ratio/remainder technique BillService.pay() uses for
     * bills - and updates each invoice's amountPaid/status as it's applied.
     * Returns the CASH-basis credit lines (one per income account touched).
     */
    private List<JournalLineRequest> buildCashBasisIncomeLines(Unit unit, Long tenantId, BigDecimal paymentAmount) {
        List<Invoice> outstanding = invoiceRepository
                .findByUnitIdAndTenantIdAndStatusNotOrderByInvoiceDateAsc(
                        unit.getId(), tenantId, InvoiceStatus.PAID);

        List<JournalLineRequest> lines = new ArrayList<>();
        BigDecimal remaining = paymentAmount;

        for (Invoice invoice : outstanding) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal invoiceOutstanding = invoice.getTotalAmount().subtract(invoice.getAmountPaid());
            if (invoiceOutstanding.compareTo(BigDecimal.ZERO) <= 0) continue; // defensive; shouldn't happen here

            BigDecimal applied = remaining.min(invoiceOutstanding);
            BigDecimal ratio = applied.divide(invoice.getTotalAmount(), 10, RoundingMode.HALF_UP);

            BigDecimal allocated = BigDecimal.ZERO;
            List<InvoiceLineItem> items = invoice.getLineItems();
            for (int i = 0; i < items.size(); i++) {
                InvoiceLineItem item = items.get(i);
                BigDecimal share;
                if (i == items.size() - 1) {
                    share = applied.subtract(allocated); // last line absorbs rounding remainder
                } else {
                    share = item.getAmount().multiply(ratio).setScale(2, RoundingMode.HALF_UP);
                    allocated = allocated.add(share);
                }
                if (share.compareTo(BigDecimal.ZERO) <= 0) continue;
                lines.add(new JournalLineRequest(
                        item.getIncomeAccountId(),
                        "Payment applied - Invoice #" + invoice.getId() + ": " + item.getDescription(),
                        BigDecimal.ZERO,
                        share,
                        LedgerSourceType.PAYMENT_RECEIVED,
                        LineBasis.CASH));
            }

            invoice.setAmountPaid(invoice.getAmountPaid().add(applied));
            invoice.setStatus(invoice.getAmountPaid().compareTo(invoice.getTotalAmount()) >= 0
                    ? InvoiceStatus.PAID
                    : InvoiceStatus.PARTIALLY_PAID);
            invoiceRepository.save(invoice);

            remaining = remaining.subtract(applied);
        }

        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            // unit.balance said this payment should fit entirely within what's
            // outstanding, but the per-invoice ledger couldn't absorb all of it.
            // That means the two have drifted out of sync (e.g. a balance
            // adjustment that never created/updated an Invoice row). Fail loudly
            // instead of quietly booking an unapplied credit that would leave the
            // CASH-basis journal entry unbalanced.
            throw new IllegalStateException(
                    "Unable to fully apply payment of " + paymentAmount + " to unit " + unit.getId()
                            + "'s outstanding invoices; " + remaining + " could not be allocated. "
                            + "Unit balance may be out of sync with its invoice history.");
        }

        return lines;
    }

    public List<InvoiceResponse> list(Long unitId) {
        Long tenantId = TenantContext.get();

        unitRepository.findByIdAndTenantId(unitId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found: " + unitId));

        return invoiceRepository
                .findByUnitIdAndTenantIdOrderByInvoiceDateDesc(unitId, tenantId)
                .stream()
                .map(inv -> toResponse(inv,
                        inv.getLineItems().isEmpty() ? "" :
                                unitRepository.findById(inv.getUnitId())
                                        .map(Unit::getUnitNumber).orElse("")))
                .toList();
    }

    private InvoiceResponse toResponse(Invoice inv, String unitNumber) {
        List<InvoiceLineItemResponse> lineItems = inv.getLineItems().stream()
                .map(l -> new InvoiceLineItemResponse(
                        l.getId(),
                        l.getDescription(),
                        l.getIncomeAccountId(),
                        l.getIncomeAccountName(),
                        l.getAmount()))
                .toList();

        return new InvoiceResponse(
                inv.getId(),
                inv.getUnitId(),
                unitNumber,
                inv.getAssociationId(),
                inv.getInvoiceDate(),
                inv.getDueDate(),
                inv.getTotalAmount(),
                inv.getAmountPaid(),
                inv.getTotalAmount().subtract(inv.getAmountPaid()),
                inv.getNotes(),
                lineItems,
                inv.getCreatedAt()
        );
    }
}