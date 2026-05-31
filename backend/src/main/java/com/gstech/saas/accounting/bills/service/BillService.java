package com.gstech.saas.accounting.bills.service;

import com.gstech.saas.accounting.banking.model.Banking;
import com.gstech.saas.accounting.banking.repository.BankingRepository;
import com.gstech.saas.accounting.banking.service.BankingService;
import com.gstech.saas.accounting.bills.dto.*;
import com.gstech.saas.accounting.bills.model.Bill;
import com.gstech.saas.accounting.bills.model.BillLineItem;
import com.gstech.saas.accounting.bills.model.BillStatus;
import com.gstech.saas.accounting.bills.repository.BillRepository;
import com.gstech.saas.accounting.bills.specification.BillSpecification;
import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.coa.service.CoaService;
import com.gstech.saas.accounting.journal.dto.CreateJournalRequest;
import com.gstech.saas.accounting.journal.dto.JournalLineRequest;
import com.gstech.saas.accounting.journal.service.JournalService;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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

    private Long tenantId() { return TenantContext.get(); }

    /* ── Bill Number Generator ─────────────────────────────────────────────── */

    private String generateBillNumber(Long tenantId) {
        long count = billRepository.countByTenantId(tenantId) + 1;
        return String.format("BILL-%03d", count);
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

    /* ── Delete ────────────────────────────────────────────────────────────── */

    public void delete(Long id) {
        Bill bill = findForTenant(id);
        if (bill.getStatus() != BillStatus.UNPAID) {
            throw new IllegalStateException("Only unpaid bills can be deleted");
        }
        billRepository.delete(bill);
    }

    /* ── Pay ───────────────────────────────────────────────────────────────── */

    public BillResponse pay(Long id, PayBillRequest request) {
        Long tenantId = tenantId();
        Bill bill = findForTenant(id);

        if (bill.getStatus() == BillStatus.PAID) {
            throw new IllegalStateException("Bill is already paid");
        }

        Banking bankAccount = bankingRepository
                .findByIdAndTenantId(request.bankAccountId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Bank account not found with id: " + request.bankAccountId()));

        // Accounts Payable (LIABILITIES) — explicit or first found
        Coa apAccount = (request.apAccountId() != null)
                ? coaRepository.findByIdAndTenantIdAndIsDeletedFalse(request.apAccountId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "AP account not found: " + request.apAccountId()))
                : coaRepository.findFirstByTenantIdAndAccountTypeAndIsDeletedFalse(tenantId, AccountType.LIABILITIES)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No LIABILITIES account found. Create one in Chart of Accounts."));

        // Cash (ASSETS) — explicit or first found
        Coa cashAccount = (request.cashAccountId() != null)
                ? coaRepository.findByIdAndTenantIdAndIsDeletedFalse(request.cashAccountId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Cash account not found: " + request.cashAccountId()))
                : coaRepository.findFirstByTenantIdAndAccountTypeAndIsDeletedFalse(tenantId, AccountType.ASSETS)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No ASSETS account found. Create one in Chart of Accounts."));

        // Balanced journal entry:
        //   DEBIT  Accounts Payable — clears the liability
        //   CREDIT Cash             — cash leaves the HOA
        List<JournalLineRequest> lines = List.of(
                new JournalLineRequest(
                        apAccount.getId(),
                        "Bill payment - AP: " + bill.getBillNumber(),
                        bill.getTotalAmount(),
                        BigDecimal.ZERO
                ),
                new JournalLineRequest(
                        cashAccount.getId(),
                        "Bill payment - Cash (" + bankAccount.getBankAccountName() + "): " + bill.getBillNumber(),
                        BigDecimal.ZERO,
                        bill.getTotalAmount()
                )
        );

        journalService.create(new CreateJournalRequest(
                request.paymentDate(),
                bill.getAssociationId(),
                "Bill Payment: " + bill.getBillNumber(),
                null,
                lines
        ));

        bill.setStatus(BillStatus.PAID);
        bill.setPaidAt(Instant.now());
        bill.setPaidFromBankAccountId(request.bankAccountId());

        return toResponse(bill);
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
                bill.getMemo(),
                bill.getPaidAt(),
                bankAccountId,
                bankAccountName,
                lineItems
        );
    }
}