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
                                        .map(u -> u.getUnitNumber()).orElse("")))
                .toList();
    }

    /* ── Payments (BE-01 / BE-12) ─────────────────────────────────────────── */

    @Transactional
    public InvoicePaymentResponse recordPayment(Long invoiceId, RecordInvoicePaymentRequest request) {
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

        Banking bankAccount = bankingRepository.findByIdAndTenantId(request.bankAccountId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Bank account not found with id: " + request.bankAccountId()));

        Long cashCoaId = request.cashAccountId() != null
                ? request.cashAccountId()
                : bankAccount.getCoaAccountId();
        if (cashCoaId == null) {
            throw new EntityNotFoundException("Bank account has no linked COA account");
        }
        Coa cashAccount = coaRepository.findByIdAndTenantIdAndIsDeletedFalse(cashCoaId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Cash account not found: " + cashCoaId));

        Coa arAccount = resolveArAccount(tenantId);

        BigDecimal paymentAmount = request.amount();
        BigDecimal ratio = paymentAmount.divide(invoice.getTotalAmount(), 10, RoundingMode.HALF_UP);

        List<JournalLineRequest> lines = new ArrayList<>();

        // BOTH: cash arrives in the bank
        lines.add(new JournalLineRequest(
                cashAccount.getId(),
                "Payment received - Cash (" + bankAccount.getBankAccountName() + "): Invoice #" + invoice.getId(),
                paymentAmount,
                BigDecimal.ZERO,
                LedgerSourceType.PAYMENT_RECEIVED,
                LineBasis.BOTH));

        // ACCRUAL: clears this much of the receivable
        lines.add(new JournalLineRequest(
                arAccount.getId(),
                "Payment received - AR: Invoice #" + invoice.getId(),
                BigDecimal.ZERO,
                paymentAmount,
                LedgerSourceType.PAYMENT_RECEIVED,
                LineBasis.ACCRUAL));

        // CASH: income recognized proportionally to what's actually being received now
        BigDecimal allocated = BigDecimal.ZERO;
        List<InvoiceLineItem> items = invoice.getLineItems();
        for (int i = 0; i < items.size(); i++) {
            InvoiceLineItem item = items.get(i);
            BigDecimal share;
            if (i == items.size() - 1) {
                share = paymentAmount.subtract(allocated);
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
                    LineBasis.CASH));
        }

        journalService.create(new CreateJournalRequest(
                request.paymentDate(),
                invoice.getAssociationId(),
                "Invoice Payment: #" + invoice.getId(),
                request.memo(),
                lines
        ));

        InvoicePayment payment = new InvoicePayment();
        payment.setInvoiceId(invoice.getId());
        payment.setAmount(paymentAmount);
        payment.setPaymentDate(request.paymentDate());
        payment.setBankAccountId(request.bankAccountId());
        payment.setMemo(request.memo());
        payment.setIdempotencyKey(request.idempotencyKey());
        payment = invoicePaymentRepository.save(payment);

        invoice.setAmountPaid(invoice.getAmountPaid().add(paymentAmount));
        invoice.setStatus(invoice.getAmountPaid().compareTo(invoice.getTotalAmount()) >= 0
                ? InvoiceStatus.PAID
                : InvoiceStatus.PARTIALLY_PAID);
        invoiceRepository.save(invoice);

        return toResponse(payment);
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