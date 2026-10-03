package com.gstech.saas.accounting.bills.service;

import com.gstech.saas.accounting.banking.model.Banking;
import com.gstech.saas.accounting.banking.repository.BankingRepository;
import com.gstech.saas.accounting.banking.service.BankingService;
import com.gstech.saas.accounting.bills.dto.*;
import com.gstech.saas.accounting.bills.model.Bill;
import com.gstech.saas.accounting.bills.model.BillLineItem;
import com.gstech.saas.accounting.bills.model.BillPayment;
import com.gstech.saas.accounting.bills.model.BillStatus;
import com.gstech.saas.accounting.bills.repository.BillPaymentRepository;
import com.gstech.saas.accounting.bills.repository.BillRepository;
import com.gstech.saas.accounting.bills.specification.BillSpecification;
import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.coa.service.CoaService;
import com.gstech.saas.accounting.journal.dto.CreateJournalRequest;
import com.gstech.saas.accounting.journal.dto.JournalLineRequest;
import com.gstech.saas.accounting.journal.service.JournalService;
import com.gstech.saas.accounting.ledger.dto.LedgerSourceType;
import com.gstech.saas.accounting.ledger.dto.LineBasis;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BillService {

    private final BillRepository    billRepository;
    private final JournalService    journalService;
    private final BankingRepository bankingRepository;
    private final CoaRepository     coaRepository;
    private final BankingService    bankingService;
    private final CoaService        coaService;
    private final BillPaymentRepository billPaymentRepository;

    private static final String AP_ACCOUNT_CODE = "2000"; // seeded "Accounts Payable"

    private Long tenantId() { return TenantContext.get(); }

    /* ── Bill Number Generator ─────────────────────────────────────────────── */

    private String generateBillNumber(Long tenantId) {
        long count = billRepository.countByTenantId(tenantId) + 1;
        return String.format("BILL-%03d", count);
    }

    /* ── AP account resolution ────────────────────────────────────────────── */

    private Coa resolveApAccount(Long tenantId, Long explicitId) {
        if (explicitId != null) {
            return coaRepository.findByIdAndTenantIdAndIsDeletedFalse(explicitId, tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("AP account not found: " + explicitId));
        }
        return coaRepository.findByTenantIdAndAccountCodeAndIsDeletedFalse(tenantId, AP_ACCOUNT_CODE)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Accounts Payable account (code " + AP_ACCOUNT_CODE + ") not found for tenant. "
                                + "Check Chart of Accounts setup."));
    }

    /* ── Accrual booking journal (Dr Expense / Cr AP), or its exact reverse ─ */

    private void postBillBookingJournal(Bill bill, boolean reverse) {
        Coa ap = resolveApAccount(bill.getTenantId(), null);
        String label = (reverse ? "Bill reversal - " : "Bill booked - ") + bill.getBillNumber();

        List<JournalLineRequest> lines = new ArrayList<>();
        for (BillLineItem item : bill.getLineItems()) {
            lines.add(new JournalLineRequest(
                    item.getExpenseAccountId(),
                    label + ": " + item.getDescription(),
                    reverse ? BigDecimal.ZERO : item.getAmount(),
                    reverse ? item.getAmount() : BigDecimal.ZERO,
                    LedgerSourceType.OTHER,
                    LineBasis.ACCRUAL));
        }
        lines.add(new JournalLineRequest(
                ap.getId(),
                label + " (AP)",
                reverse ? bill.getTotalAmount() : BigDecimal.ZERO,
                reverse ? BigDecimal.ZERO : bill.getTotalAmount(),
                LedgerSourceType.OTHER,
                LineBasis.ACCRUAL));

        journalService.create(new CreateJournalRequest(
                bill.getIssueDate(),
                bill.getAssociationId(),
                label,
                null,
                lines
        ));
    }

    /* ── Create ────────────────────────────────────────────────────────────── */

    public BillResponse create(CreateBillRequest request) {
        Long tenantId = tenantId();

        String billNumber = (request.billNumber() == null || request.billNumber().isBlank())
                ? generateBillNumber(tenantId)
                : request.billNumber();

        Bill bill = new Bill();
        bill.setTenantId(tenantId);
        bill.setBillNumber(billNumber);
        bill.setVendorId(request.vendorId());
        bill.setAssociationId(request.associationId());
        bill.setIssueDate(request.issueDate());
        bill.setDueDate(request.dueDate());
        bill.setMemo(request.memo());
        bill.setStatus(BillStatus.UNPAID);

        BigDecimal total = BigDecimal.ZERO;
        for (BillLineItemRequest lineReq : request.lineItems()) {
            BillLineItem line = new BillLineItem();
            line.setBill(bill);
            line.setDescription(lineReq.description());
            line.setExpenseAccountId(lineReq.expenseAccountId());
            line.setAmount(lineReq.amount());
            total = total.add(lineReq.amount());
            bill.getLineItems().add(line);
        }

        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Bill total amount must be greater than zero");
        }

        bill.setTotalAmount(total);
        billRepository.save(bill);

        postBillBookingJournal(bill, false);

        return toResponse(bill);
    }

    /* ── Get by ID ─────────────────────────────────────────────────────────── */

    public BillResponse getById(Long id) {
        return toResponse(findForTenant(id));
    }

    /* ── List / Filter ─────────────────────────────────────────────────────── */

    public Page<BillResponse> list(
            Long associationId,
            BillStatus status,
            LocalDate from,
            LocalDate to,
            Pageable pageable) {

        return billRepository
                .findAll(
                        BillSpecification.withFilters(tenantId(), associationId, status, from, to),
                        pageable
                )
                .map(this::toResponse);
    }

    /* ── Update ────────────────────────────────────────────────────────────── */

    public BillResponse update(Long id, CreateBillRequest request) {
        Bill bill = findForTenant(id);

        if (bill.getStatus() == BillStatus.PAID || bill.getStatus() == BillStatus.PARTIALLY_PAID) {
            throw new IllegalStateException("Cannot update a bill that has payments recorded against it");
        }

        // Reverse the old accrual booking before the old line items are gone
        postBillBookingJournal(bill, true);

        bill.getLineItems().clear();

        BigDecimal total = BigDecimal.ZERO;
        for (BillLineItemRequest lineReq : request.lineItems()) {
            BillLineItem line = new BillLineItem();
            line.setBill(bill);
            line.setDescription(lineReq.description());
            line.setExpenseAccountId(lineReq.expenseAccountId());
            line.setAmount(lineReq.amount());
            total = total.add(lineReq.amount());
            bill.getLineItems().add(line);
        }

        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Bill total amount must be greater than zero");
        }

        bill.setTotalAmount(total);

        // Book the new line items
        postBillBookingJournal(bill, false);

        return toResponse(bill);
    }

    /* ── Delete ────────────────────────────────────────────────────────────── */

    public void delete(Long id) {
        Bill bill = findForTenant(id);
        if (bill.getStatus() != BillStatus.UNPAID) {
            throw new IllegalStateException("Only unpaid bills can be deleted");
        }
        postBillBookingJournal(bill, true);
        billRepository.delete(bill);
    }

    /* ── Pay ───────────────────────────────────────────────────────────────── */


    public BillResponse pay(Long id, PayBillRequest request) {
        Long tenantId = tenantId();
        Bill bill = findForTenant(id);

        if (bill.getStatus() == BillStatus.PAID) {
            throw new IllegalStateException("Bill is already paid");
        }

        BigDecimal remaining = bill.getTotalAmount().subtract(bill.getAmountPaid());
        if (request.amount().compareTo(remaining) > 0) {
            throw new IllegalArgumentException(
                    "Payment amount " + request.amount() + " exceeds remaining balance " + remaining);
        }

        Banking bankAccount = bankingRepository
                .findByIdAndTenantId(request.bankAccountId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Bank account not found with id: " + request.bankAccountId()));

        Coa apAccount = resolveApAccount(tenantId, request.apAccountId());

        Long cashCoaId = request.cashAccountId() != null
                ? request.cashAccountId()
                : bankAccount.getCoaAccountId();
        if (cashCoaId == null) {
            throw new EntityNotFoundException("Bank account has no linked COA account");
        }
        Coa cashAccount = coaRepository.findByIdAndTenantIdAndIsDeletedFalse(cashCoaId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Cash account not found: " + cashCoaId));

        String num = bill.getBillNumber();
        BigDecimal paymentAmount = request.amount();
        // Ratio of this payment against the bill's total — used to prorate the
        // CASH-basis expense recognition across line items for a partial payment.
        BigDecimal ratio = paymentAmount.divide(bill.getTotalAmount(), 10, RoundingMode.HALF_UP);

        List<JournalLineRequest> lines = new ArrayList<>();

        // ACCRUAL: clears this much of the payable
        lines.add(new JournalLineRequest(
                apAccount.getId(),
                "Bill payment - AP: " + num,
                paymentAmount,
                BigDecimal.ZERO,
                LedgerSourceType.OTHER,
                LineBasis.ACCRUAL));

        // CASH: expense recognized proportionally to what's actually being paid now
        BigDecimal allocated = BigDecimal.ZERO;
        List<BillLineItem> items = bill.getLineItems();
        for (int i = 0; i < items.size(); i++) {
            BillLineItem item = items.get(i);
            BigDecimal share;
            if (i == items.size() - 1) {
                share = paymentAmount.subtract(allocated); // last line absorbs rounding remainder
            } else {
                share = item.getAmount().multiply(ratio).setScale(2, RoundingMode.HALF_UP);
                allocated = allocated.add(share);
            }
            if (share.compareTo(BigDecimal.ZERO) <= 0) continue;
            lines.add(new JournalLineRequest(
                    item.getExpenseAccountId(),
                    "Bill payment - Expense: " + num + ": " + item.getDescription(),
                    share,
                    BigDecimal.ZERO,
                    LedgerSourceType.OTHER,
                    LineBasis.CASH));
        }

        // BOTH: cash leaves the bank
        lines.add(new JournalLineRequest(
                cashAccount.getId(),
                "Bill payment - Cash (" + bankAccount.getBankAccountName() + "): " + num,
                BigDecimal.ZERO,
                paymentAmount,
                LedgerSourceType.OTHER,
                LineBasis.BOTH));

        journalService.create(new CreateJournalRequest(
                request.paymentDate(),
                bill.getAssociationId(),
                "Bill Payment: " + num,
                null,
                lines
        ));

        BillPayment payment = new BillPayment();
        payment.setBillId(bill.getId());
        payment.setAmount(paymentAmount);
        payment.setPaymentDate(request.paymentDate());
        payment.setBankAccountId(request.bankAccountId());
        billPaymentRepository.save(payment);

        bill.setAmountPaid(bill.getAmountPaid().add(paymentAmount));
        bill.setPaidFromBankAccountId(request.bankAccountId());

        if (bill.getAmountPaid().compareTo(bill.getTotalAmount()) >= 0) {
            bill.setStatus(BillStatus.PAID);
            bill.setPaidAt(Instant.now());
        } else {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }

        return toResponse(bill);
    }

    // ADD new method, for a per-bill payment history view:
    public List<BillPaymentResponse> getPayments(Long id) {
        findForTenant(id); // 404 if the bill doesn't exist or isn't this tenant's
        return billPaymentRepository.findByBillIdOrderByPaymentDateDescIdDesc(id).stream()
                .map(p -> new BillPaymentResponse(
                        p.getId(),
                        p.getAmount(),
                        p.getPaymentDate(),
                        p.getBankAccountId(),
                        bankingService.getAccountById(p.getBankAccountId()).bankAccountName()
                ))
                .toList();
    }

    /* ── Summary ───────────────────────────────────────────────────────────── */

    public BillSummaryResponse getSummary(Long associationId) {
        return billRepository.getBillSummary(tenantId(), associationId);
    }

    /* ── Helpers ───────────────────────────────────────────────────────────── */

    private Bill findForTenant(Long id) {
        return billRepository
                .findByIdAndTenantId(id, tenantId())
                .orElseThrow(() -> new EntityNotFoundException("Bill not found"));
    }

    // REPLACE toResponse():
    private BillResponse toResponse(Bill bill) {
        Long bankAccountId = bill.getPaidFromBankAccountId();
        String bankAccountName = null;

        if (bankAccountId != null) {
            bankAccountName = bankingService.getAccountById(bankAccountId).bankAccountName();
        }

        List<BillLineItemResponse> lineItems = bill.getLineItems().stream()
                .map(item -> new BillLineItemResponse(
                        item.getDescription(),
                        item.getExpenseAccountId(),
                        coaService.getAccount(item.getExpenseAccountId()).accountName(),
                        item.getAmount()
                ))
                .toList();

        return new BillResponse(
                bill.getId(),
                bill.getBillNumber(),
                bill.getVendorId(),
                bill.getAssociationId(),
                bill.getIssueDate(),
                bill.getDueDate(),
                bill.getStatus(),
                bill.getTotalAmount(),
                bill.getAmountPaid(),
                bill.getTotalAmount().subtract(bill.getAmountPaid()),
                bill.getMemo(),
                bill.getPaidAt(),
                bankAccountId,
                bankAccountName,
                lineItems
        );
    }
}