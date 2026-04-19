package com.gstech.saas.accounting.bills.service;

import com.gstech.saas.accounting.bills.dto.*;
import com.gstech.saas.accounting.bills.model.Bill;
import com.gstech.saas.accounting.bills.model.BillLineItem;
import com.gstech.saas.accounting.bills.model.BillStatus;
import com.gstech.saas.accounting.bills.repository.BillRepository;
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

        if (request.lineItems() != null) {
            for (BillLineItemRequest lineReq : request.lineItems()) {

                BillLineItem line = new BillLineItem();
                line.setBill(bill);
                line.setDescription(lineReq.description());
                line.setExpenseAccountId(lineReq.expenseAccountId());
                line.setAmount(lineReq.amount());

                total = total.add(lineReq.amount());
                bill.getLineItems().add(line);
            }
        }

        bill.setTotalAmount(total);

        billRepository.save(bill);

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

        if (request.lineItems() != null) {
            for (BillLineItemRequest lineReq : request.lineItems()) {

                BillLineItem line = new BillLineItem();
                line.setBill(bill);
                line.setDescription(lineReq.description());
                line.setExpenseAccountId(lineReq.expenseAccountId());
                line.setAmount(lineReq.amount());

                total = total.add(lineReq.amount());
                bill.getLineItems().add(line);
            }
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

    public BillResponse pay(Long id, PayBillRequest request) {

        Bill bill = findForTenant(id);

        if (bill.getStatus() == BillStatus.PAID) {
            throw new IllegalStateException("Bill already paid");
        }

        bill.setStatus(BillStatus.PAID);
        bill.setPaidAt(Instant.now());
        bill.setPaidFromBankAccountId(request.bankAccountId());

        List<JournalLineRequest> lines = new ArrayList<>();

        // Debit expense accounts
        for (BillLineItem item : bill.getLineItems()) {
            lines.add(new JournalLineRequest(
                    item.getExpenseAccountId(),
                    "Bill payment: " + bill.getBillNumber(),
                    item.getAmount(),
                    BigDecimal.ZERO
            ));
        }

        // Credit Cash (temporary 1000L — replace with lookup later)
        lines.add(new JournalLineRequest(
                1000L,
                "Cash payment: " + bill.getBillNumber(),
                BigDecimal.ZERO,
                bill.getTotalAmount()
        ));

        CreateJournalRequest journalRequest = new CreateJournalRequest(
                request.paymentDate(),
                bill.getAssociationId(),
                "Bill Payment " + bill.getBillNumber(),
                null,
                lines
        );

        journalService.create(journalRequest);

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
                bill.getPaidAt()
        );
    }
}