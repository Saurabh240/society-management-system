package com.gstech.saas.accounting.bills.service;

import com.gstech.saas.accounting.banking.model.Banking;
import com.gstech.saas.accounting.banking.repository.BankingRepository;
import com.gstech.saas.accounting.banking.service.BankingService;

import com.gstech.saas.accounting.bills.dto.*;
import com.gstech.saas.accounting.bills.model.Bill;
import com.gstech.saas.accounting.bills.model.BillLineItem;
import com.gstech.saas.accounting.bills.model.BillStatus;
import com.gstech.saas.accounting.bills.repository.BillRepository;
import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.coa.service.CoaService;
import com.gstech.saas.accounting.journal.dto.CreateJournalRequest;
import com.gstech.saas.accounting.journal.dto.JournalLineRequest;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import com.gstech.saas.accounting.journal.service.JournalService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BillService {

    private final BillRepository billRepository;
    private final JournalService journalService;
    private final BankingRepository bankingRepository;  // ← added
    private final CoaRepository coaRepository;
    private final BankingService bankingService;
    private final CoaService coaService;

    private Long tenantId() {
        return TenantContext.get();
    }

    /* ===============================
       BILL NUMBER GENERATOR
       =============================== */

    private String generateBillNumber(Long tenantId) {
        long count = billRepository.countByTenantId(tenantId) + 1;
        return String.format("BILL-%03d", count);
    }

    /* ===============================
       CREATE BILL
       =============================== */

    public BillResponse create(CreateBillRequest request) {

        Long tenantId = tenantId();

        Bill bill = new Bill();
        bill.setTenantId(tenantId);

        String billNumber = request.billNumber();
        if (billNumber == null || billNumber.isBlank()) {
            billNumber = generateBillNumber(tenantId);
        }

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

        return toResponse(bill);
    }

    /* ===============================
       GET Bill by Id
       =============================== */

    public BillResponse getById(Long id) {
        Bill bill = findForTenant(id);
        return toResponse(bill);
    }
    /* ===============================
       LIST / FILTER
       =============================== */

    public Page<BillResponse> list(
            Long associationId,
            BillStatus status,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {

        Page<Bill> page = billRepository.findFiltered(
                tenantId(),
                associationId,
                status,
                from,
                to,
                pageable
        );

        return page.map(this::toResponse);
    }

    /* ===============================
       UPDATE
       =============================== */

    public BillResponse update(Long id, CreateBillRequest request) {

        Bill bill = findForTenant(id);

        if (bill.getStatus() == BillStatus.PAID) {
            throw new IllegalStateException("Cannot update a paid bill");
        }

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

        return toResponse(bill);
    }

    /* ===============================
       DELETE
       =============================== */

    public void delete(Long id) {

        Bill bill = findForTenant(id);

        if (bill.getStatus() != BillStatus.UNPAID) {
            throw new IllegalStateException("Only unpaid bills can be deleted");
        }

        billRepository.delete(bill);
    }

    /* ===============================
       PAY BILL
       =============================== */

    /**
     * Marks bill as PAID and auto-creates a balanced journal entry:
     *
     *   DEBIT  Accounts Payable (LIABILITIES)  =  bill.totalAmount
     *   CREDIT Cash / Bank Account (ASSETS)    =  bill.totalAmount
     *
     * Double-entry explanation:
     *  - When the bill was created, we owed the vendor (Accounts Payable increased).
     *  - When we pay, we clear that liability (debit AP) and reduce our cash (credit Cash).
     */
    public BillResponse pay(Long id, PayBillRequest request) {

        Long tenantId = tenantId();
        Bill bill     = findForTenant(id);

        if (bill.getStatus() == BillStatus.PAID) {
            throw new IllegalStateException("Bill is already paid");
        }

        // ── 1. Look up the bank account ───────────────────────────────────────
        Banking bankAccount = bankingRepository
                .findByIdAndTenantId(request.bankAccountId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Bank account not found with id: " + request.bankAccountId()));

        // ── 2. Find Accounts Payable CoA account (LIABILITIES) ───────────────
        //    This is the DEBIT side — we are clearing the liability
        Coa apAccount = coaRepository
                .findFirstByTenantIdAndAccountTypeAndIsDeletedFalse(tenantId, AccountType.LIABILITIES)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No Accounts Payable (LIABILITIES) account found. " +
                                "Please create one in Chart of Accounts first."));

        // ── 3. Find Cash CoA account (ASSETS) ────────────────────────────────
        //    This is the CREDIT side — cash leaves the bank account
        Coa cashAccount = coaRepository
                .findFirstByTenantIdAndAccountTypeAndIsDeletedFalse(tenantId, AccountType.ASSETS)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No Cash (ASSETS) account found. " +
                                "Please create one in Chart of Accounts first."));

        // ── 4. Build balanced journal entry ───────────────────────────────────
        List<JournalLineRequest> lines = List.of(
                // DEBIT  Accounts Payable — clears the liability created when bill was recorded
                new JournalLineRequest(
                        apAccount.getId(),
                        "Bill payment - AP: " + bill.getBillNumber(),
                        bill.getTotalAmount(),
                        BigDecimal.ZERO
                ),
                // CREDIT Cash — cash leaves the bank account
                new JournalLineRequest(
                        cashAccount.getId(),
                        "Bill payment - Cash (" + bankAccount.getBankAccountName() + "): "
                                + bill.getBillNumber(),
                        BigDecimal.ZERO,
                        bill.getTotalAmount()
                )
        );

        CreateJournalRequest journalRequest = new CreateJournalRequest(
                request.paymentDate(),
                bill.getAssociationId(),
                "Bill Payment: " + bill.getBillNumber(),
                null,
                lines
        );

        journalService.create(journalRequest);

        // ── 5. Mark bill as PAID ──────────────────────────────────────────────
        bill.setStatus(BillStatus.PAID);
        bill.setPaidAt(Instant.now());
        bill.setPaidFromBankAccountId(request.bankAccountId());

        return toResponse(bill);
    }

    /* ===============================
       BILL Summary
      =============================== */
    public BillSummaryResponse getSummary(Long associationId) {
        return billRepository.getBillSummary(
                tenantId(),
                associationId
        );
    }

    /* ===============================
       INTERNAL HELPERS
       =============================== */

    private Bill findForTenant(Long id) {
        return billRepository
                .findByIdAndTenantId(id, tenantId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Bill not found"));
    }

    private BillResponse toResponse(Bill bill) {
        String bankAccountName = null;

        if (bill.getPaidFromBankAccountId() != null) {
            bankAccountName = bankingService
                    .getAccountById(bill.getPaidFromBankAccountId())
                    .bankAccountName();
        }
        List<BillLineItemResponse> lineItems = bill.getLineItems().stream()
                .map(item -> {

                    String expenseAccountName = coaService
                            .getAccount(item.getExpenseAccountId())
                            .accountName();

                    return new BillLineItemResponse(
                            item.getDescription(),
                            item.getExpenseAccountId(),
                            expenseAccountName,
                            item.getAmount()
                    );
                })
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
                bill.getMemo(),
                bill.getPaidAt(),
                bankAccountName,
                lineItems

        );
    }
}