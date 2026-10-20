package com.gstech.saas.accounting.invoice.service;

import com.gstech.saas.accounting.banking.model.Banking;
import com.gstech.saas.accounting.banking.repository.BankingRepository;
import com.gstech.saas.accounting.banking.service.BankingService;
import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.invoice.dto.*;
import com.gstech.saas.accounting.invoice.model.Invoice;
import com.gstech.saas.accounting.invoice.model.InvoiceLineItem;
import com.gstech.saas.accounting.invoice.model.InvoicePayment;
import com.gstech.saas.accounting.invoice.model.InvoiceStatus;
import com.gstech.saas.accounting.invoice.repository.InvoicePaymentRepository;
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
import jakarta.validation.Valid;
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

    private final InvoiceRepository        invoiceRepository;
    private final InvoicePaymentRepository invoicePaymentRepository;
    private final UnitRepository           unitRepository;
    private final CoaRepository            coaRepository;
    private final JournalService           journalService;
    private final BankingRepository        bankingRepository;
    private final BankingService           bankingService;

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
                LineBasis.ACCRUAL,
                unit.getId()));

        for (int i = 0; i < request.lineItems().size(); i++) {
            InvoiceLineItemRequest item = request.lineItems().get(i);
            lines.add(new JournalLineRequest(
                    item.incomeAccountId(),
                    item.description(),
                    BigDecimal.ZERO,
                    item.amount(),
                    LedgerSourceType.INVOICE_CHARGE,
                    LineBasis.ACCRUAL,
                    unit.getId()));
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

    /* ── Payments ──────────────────────────────────────────────────────────── */

    /**
     * Payment against ONE specific invoice
     * (POST /units/{unitId}/invoices/{invoiceId}/payments).
     */
    @Transactional
    public InvoicePaymentResponse recordPayment(Long invoiceId, @Valid RecordInvoicePaymentRequest request) {
        Long tenantId = TenantContext.get();
        Invoice invoice = findInvoiceForTenant(invoiceId, tenantId);

        // Idempotent replay: same key for this invoice returns the prior result untouched.
        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            var existing = invoicePaymentRepository
                    .findByTenantIdAndInvoiceIdAndIdempotencyKey(tenantId, invoiceId, request.idempotencyKey());
            if (existing.isPresent()) {
                return toResponse(existing.get());
            }
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalStateException("Invoice is already paid");
        }

        BigDecimal remaining = invoice.getTotalAmount().subtract(invoice.getAmountPaid());
        if (request.amount().compareTo(remaining) > 0) {
            throw new IllegalArgumentException(
                    "Payment amount " + request.amount() + " exceeds remaining balance " + remaining);
        }

        // NOTE: request.cashAccountId() is deliberately ignored. The cash side of
        // the journal is always the bank account's own linked GL account; the
        // Receive Payment page used to send the selected INCOME account in this
        // field, which made the entry debit an income account and never record cash.
        InvoicePayment payment = applyPayment(invoice, request.amount(), request.paymentDate(),
                request.bankAccountId(), request.memo(), request.idempotencyKey(), tenantId);
        return toResponse(payment);
    }

    /**
     * Payment against a UNIT's outstanding balance
     * (POST /units/{unitId}/payments). Applied FIFO across the unit's unpaid
     * invoices, oldest first; each invoice gets its own payment row and its own
     * journal entry. Previously this route handed the unit id to the
     * invoice-level method, i.e. it paid whichever invoice happened to have the
     * same numeric id.
     */
    @Transactional
    public RecordUnitPaymentResponse recordUnitPayment(Long unitId, RecordUnitPaymentRequest request) {
        Long tenantId = TenantContext.get();

        Unit unit = unitRepository.findByIdAndTenantId(unitId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found: " + unitId));

        List<Invoice> outstanding = invoiceRepository
                .findByUnitIdAndTenantIdAndStatusNotOrderByInvoiceDateAsc(unitId, tenantId, InvoiceStatus.PAID);

        BigDecimal totalOutstanding = BigDecimal.ZERO;
        for (Invoice inv : outstanding) {
            BigDecimal due = inv.getTotalAmount().subtract(inv.getAmountPaid());
            if (due.compareTo(BigDecimal.ZERO) > 0) totalOutstanding = totalOutstanding.add(due);
        }

        if (totalOutstanding.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("This unit has no outstanding invoices to apply a payment to");
        }
        if (request.amount().compareTo(totalOutstanding) > 0) {
            throw new IllegalArgumentException(
                    "Payment amount " + request.amount() + " exceeds outstanding balance " + totalOutstanding);
        }

        String memo = joinNonBlank(
                request.referenceNumber() != null && !request.referenceNumber().isBlank()
                        ? "Ref: " + request.referenceNumber() : null,
                request.memo());

        BigDecimal remaining = request.amount();
        for (Invoice invoice : outstanding) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal due = invoice.getTotalAmount().subtract(invoice.getAmountPaid());
            if (due.compareTo(BigDecimal.ZERO) <= 0) continue;

            BigDecimal applied = remaining.min(due);
            applyPayment(invoice, applied, request.paymentDate(), request.bankAccountId(), memo, null, tenantId);
            remaining = remaining.subtract(applied);
        }

        log.info("Unit payment recorded: unitId={}, amount={}", unitId, request.amount());
        return new RecordUnitPaymentResponse(unitId, request.amount(), request.paymentDate(), unit.getBalance());
    }

    /**
     * Posts the journal entry for {@code amount} against ONE invoice, records the
     * payment row, updates the invoice AND reduces the unit's balance (it used to
     * be only ever increased, so the balance shown everywhere never went down).
     */
    private InvoicePayment applyPayment(Invoice invoice, BigDecimal amount, java.time.LocalDate paymentDate,
                                        Long bankAccountId, String memo, String idempotencyKey, Long tenantId) {

        Banking bankAccount = bankingRepository.findByIdAndTenantId(bankAccountId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Bank account not found with id: " + bankAccountId));

        Long cashCoaId = bankAccount.getCoaAccountId();
        if (cashCoaId == null) {
            throw new EntityNotFoundException(
                    "Bank account '" + bankAccount.getBankAccountName() + "' has no linked GL account. "
                            + "Re-save the bank account (Edit -> Save) to link one, then try again.");
        }
        Coa cashAccount = coaRepository.findByIdAndTenantIdAndIsDeletedFalse(cashCoaId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Cash account not found: " + cashCoaId));

        Coa arAccount = resolveArAccount(tenantId);
        Long unitId = invoice.getUnitId();

        BigDecimal ratio = amount.divide(invoice.getTotalAmount(), 10, RoundingMode.HALF_UP);

        List<JournalLineRequest> lines = new ArrayList<>();

        // BOTH: cash arrives in the bank
        lines.add(new JournalLineRequest(
                cashAccount.getId(),
                "Payment received - Cash (" + bankAccount.getBankAccountName() + "): Invoice #" + invoice.getId(),
                amount,
                BigDecimal.ZERO,
                LedgerSourceType.PAYMENT_RECEIVED,
                LineBasis.BOTH,
                unitId));

        // ACCRUAL: clears this much of the receivable
        lines.add(new JournalLineRequest(
                arAccount.getId(),
                "Payment received - AR: Invoice #" + invoice.getId(),
                BigDecimal.ZERO,
                amount,
                LedgerSourceType.PAYMENT_RECEIVED,
                LineBasis.ACCRUAL,
                unitId));

        // CASH: income recognized proportionally to what's actually being received now
        BigDecimal allocated = BigDecimal.ZERO;
        List<InvoiceLineItem> items = invoice.getLineItems();
        for (int i = 0; i < items.size(); i++) {
            InvoiceLineItem item = items.get(i);
            BigDecimal share;
            if (i == items.size() - 1) {
                share = amount.subtract(allocated);
            } else {
                share = item.getAmount().multiply(ratio).setScale(2, RoundingMode.HALF_UP);
                allocated = allocated.add(share);
            }
            if (share.compareTo(BigDecimal.ZERO) <= 0) continue;
            lines.add(new JournalLineRequest(
                    item.getIncomeAccountId(),
                    "Payment received - Income: Invoice #" + invoice.getId() + ": " + item.getDescription(),
                    BigDecimal.ZERO,
                    share,
                    LedgerSourceType.PAYMENT_RECEIVED,
                    LineBasis.CASH,
                    unitId));
        }

        // The 4th constructor argument is attachmentPath — the memo used to be
        // passed there by mistake.
        journalService.create(new CreateJournalRequest(
                paymentDate,
                invoice.getAssociationId(),
                joinNonBlank("Invoice Payment: #" + invoice.getId(), memo),
                null,
                lines
        ));

        InvoicePayment payment = new InvoicePayment();
        payment.setInvoiceId(invoice.getId());
        payment.setAmount(amount);
        payment.setPaymentDate(paymentDate);
        payment.setBankAccountId(bankAccountId);
        payment.setMemo(memo);
        payment.setIdempotencyKey(idempotencyKey);
        payment = invoicePaymentRepository.save(payment);

        invoice.setAmountPaid(invoice.getAmountPaid().add(amount));
        invoice.setStatus(invoice.getAmountPaid().compareTo(invoice.getTotalAmount()) >= 0
                ? InvoiceStatus.PAID
                : InvoiceStatus.PARTIALLY_PAID);
        invoiceRepository.save(invoice);

        Unit unit = unitRepository.findByIdAndTenantId(unitId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found: " + unitId));
        unit.setBalance(unit.getBalance().subtract(amount));
        unitRepository.save(unit);

        return payment;
    }

    private static String joinNonBlank(String a, String b) {
        boolean hasA = a != null && !a.isBlank();
        boolean hasB = b != null && !b.isBlank();
        if (hasA && hasB) return a + " - " + b;
        if (hasA) return a;
        return hasB ? b : null;
    }

    public List<InvoicePaymentResponse> getPayments(Long invoiceId) {
        Long tenantId = TenantContext.get();
        findInvoiceForTenant(invoiceId, tenantId); // 404 if the invoice doesn't exist or isn't this tenant's
        return invoicePaymentRepository.findByInvoiceIdOrderByPaymentDateDescIdDesc(invoiceId).stream()
                .map(this::toResponse)
                .toList();
    }

    /* ── Helpers ───────────────────────────────────────────────────────────── */

    private Invoice findInvoiceForTenant(Long id, Long tenantId) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + id));
        if (!invoice.getTenantId().equals(tenantId)) {
            throw new EntityNotFoundException("Invoice not found: " + id);
        }
        return invoice;
    }

    private Coa resolveArAccount(Long tenantId) {
        return coaRepository
                .findByTenantIdAndAccountCodeAndIsDeletedFalse(tenantId, AR_ACCOUNT_CODE)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Accounts Receivable account (code " + AR_ACCOUNT_CODE + ") not found for tenant. "
                                + "Check Chart of Accounts setup."));
    }

    private InvoiceResponse toResponse(Invoice inv, String unitNumber) {
        List<InvoiceLineItemResponse> lineItems = inv.getLineItems().stream()
                .map(l -> new InvoiceLineItemResponse(
                        l.getId(), l.getDescription(), l.getIncomeAccountId(),
                        l.getIncomeAccountName(), l.getAmount()))
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
                inv.getStatus(),
                inv.getNotes(),
                lineItems,
                inv.getCreatedAt()
        );
    }

    private InvoicePaymentResponse toResponse(InvoicePayment p) {
        return new InvoicePaymentResponse(
                p.getId(),
                p.getAmount(),
                p.getPaymentDate(),
                p.getBankAccountId(),
                bankingService.getAccountById(p.getBankAccountId()).bankAccountName(),
                p.getMemo()
        );
    }
}