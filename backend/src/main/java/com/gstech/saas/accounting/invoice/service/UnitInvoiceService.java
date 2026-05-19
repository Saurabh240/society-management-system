package com.gstech.saas.accounting.invoice.service;

import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.invoice.dto.*;
import com.gstech.saas.accounting.invoice.model.Invoice;
import com.gstech.saas.accounting.invoice.model.InvoiceLineItem;
import com.gstech.saas.accounting.invoice.repository.InvoiceRepository;
import com.gstech.saas.accounting.journal.dto.CreateJournalRequest;
import com.gstech.saas.accounting.journal.dto.JournalLineRequest;
import com.gstech.saas.accounting.journal.service.JournalService;
import com.gstech.saas.associations.unit.model.Unit;
import com.gstech.saas.associations.unit.repository.UnitRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
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


        Coa arAccount = coaRepository
                .findFirstByTenantIdAndAccountTypeAndIsDeletedFalse(tenantId, AccountType.ASSETS)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No ASSETS account found. Create one in Chart of Accounts first."));

        List<JournalLineRequest> lines = new ArrayList<>();

        lines.add(new JournalLineRequest(
                arAccount.getId(),
                "Invoice - Unit " + unit.getUnitNumber(),
                total,
                BigDecimal.ZERO));

        for (int i = 0; i < request.lineItems().size(); i++) {
            InvoiceLineItemRequest item = request.lineItems().get(i);
            lines.add(new JournalLineRequest(
                    item.incomeAccountId(),
                    item.description(),
                    BigDecimal.ZERO,
                    item.amount()));
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
                inv.getNotes(),
                lineItems,
                inv.getCreatedAt()
        );
    }
}