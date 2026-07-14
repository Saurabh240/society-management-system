package com.gstech.saas.accounting.budget.service;

import com.gstech.saas.accounting.budget.dto.*;
import com.gstech.saas.accounting.budget.model.*;
import com.gstech.saas.accounting.budget.repository.BudgetRepository;
import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CoaRepository    coaRepository;

    // ── LIST ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BudgetResponse> list(Long associationId) {
        Long tenantId = TenantContext.get();
        List<Budget> budgets = (associationId != null)
                ? budgetRepository.findByTenantIdAndAssociationIdOrderByFiscalYearDesc(tenantId, associationId)
                : budgetRepository.findByTenantIdOrderByFiscalYearDesc(tenantId);
        return budgets.stream().map(b -> toResponse(b, List.of())).toList();
    }

    // ── GET ONE WITH LINE ITEMS ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public BudgetResponse get(Long id) {
        Budget budget = findOwned(id);
        Map<Long, Coa> coaMap = buildCoaMap(budget);
        return toResponse(budget, buildLineItemResponses(budget, coaMap));
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Transactional
    public BudgetResponse create(BudgetRequest req) {
        Long tenantId = TenantContext.get();
        validateDates(req);

        Budget budget = Budget.builder()
                .associationId(req.associationId())
                .name(req.name())
                .fiscalYear(req.fiscalYear())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .notes(req.notes())
                .status(BudgetStatus.DRAFT)
                .build();

        if (req.lineItems() != null && !req.lineItems().isEmpty()) {
            populateLineItems(budget, req.lineItems(), tenantId);
        }

        Budget saved = budgetRepository.save(budget);
        Map<Long, Coa> coaMap = buildCoaMap(saved);
        return toResponse(saved, buildLineItemResponses(saved, coaMap));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @Transactional
    public BudgetResponse update(Long id, BudgetRequest req) {
        Long tenantId = TenantContext.get();
        Budget budget = findOwned(id);

        if (budget.getStatus() == BudgetStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Closed budgets cannot be modified");
        }
        validateDates(req);

        budget.setAssociationId(req.associationId());
        budget.setName(req.name());
        budget.setFiscalYear(req.fiscalYear());
        budget.setStartDate(req.startDate());
        budget.setEndDate(req.endDate());
        budget.setNotes(req.notes());

        if (req.lineItems() != null) {
            budget.getLineItems().clear();
            populateLineItems(budget, req.lineItems(), tenantId);
        }

        Budget saved = budgetRepository.save(budget);
        return toResponse(saved, buildLineItemResponses(saved, buildCoaMap(saved)));
    }

    // ── UPDATE LINE ITEMS ─────────────────────────────────────────────────────

    @Transactional
    public BudgetResponse updateLineItems(Long id, List<BudgetLineItemRequest> items) {
        Long tenantId = TenantContext.get();
        Budget budget = findOwned(id);
        if (budget.getStatus() == BudgetStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Closed budgets cannot be modified");
        }
        budget.getLineItems().clear();
        populateLineItems(budget, items, tenantId);
        Budget saved = budgetRepository.save(budget);
        return toResponse(saved, buildLineItemResponses(saved, buildCoaMap(saved)));
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        budgetRepository.delete(findOwned(id));
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private Budget findOwned(Long id) {
        return budgetRepository
                .findByIdAndTenantIdWithLineItems(id, TenantContext.get())
                .orElseThrow(() -> new EntityNotFoundException("Budget not found: " + id));
    }

    private void validateDates(BudgetRequest req) {
        if (req.startDate() != null && req.endDate() != null
                && req.startDate().isAfter(req.endDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Start date must be before or equal to end date");
        }
    }

    private void populateLineItems(Budget budget, List<BudgetLineItemRequest> items, Long tenantId) {
        Set<Long> accountIds = items.stream()
                .map(BudgetLineItemRequest::accountId).collect(Collectors.toSet());
        Map<Long, Coa> coaMap = coaRepository
                .findByTenantIdAndIdInAndIsDeletedFalse(tenantId, accountIds)
                .stream().collect(Collectors.toMap(Coa::getId, Function.identity()));

        for (BudgetLineItemRequest item : items) {
            if (!coaMap.containsKey(item.accountId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Account not found or deleted: " + item.accountId());
            }
            budget.getLineItems().add(BudgetLineItem.builder()
                    .budget(budget)
                    .accountId(item.accountId())
                    .budgetedAmount(item.budgetedAmount())
                    .notes(item.notes())
                    .build());
        }
    }

    private Map<Long, Coa> buildCoaMap(Budget budget) {
        Set<Long> ids = budget.getLineItems().stream()
                .map(BudgetLineItem::getAccountId).collect(Collectors.toSet());
        if (ids.isEmpty()) return Map.of();
        return coaRepository.findByTenantIdAndIdInAndIsDeletedFalse(TenantContext.get(), ids)
                .stream().collect(Collectors.toMap(Coa::getId, Function.identity()));
    }

    private List<BudgetLineItemResponse> buildLineItemResponses(Budget budget, Map<Long, Coa> coaMap) {
        return budget.getLineItems().stream().map(li -> {
            Coa coa = coaMap.get(li.getAccountId());
            return new BudgetLineItemResponse(li.getId(), li.getAccountId(),
                    coa != null ? coa.getAccountCode() : "",
                    coa != null ? coa.getAccountName() : "",
                    li.getBudgetedAmount(), li.getNotes());
        }).toList();
    }

    BudgetResponse toResponse(Budget b, List<BudgetLineItemResponse> lineItems) {
        return new BudgetResponse(b.getId(), b.getAssociationId(), b.getName(), b.getFiscalYear(),
                b.getStartDate(), b.getEndDate(), b.getStatus().name(), b.getNotes(),
                b.getCreatedAt(), lineItems);
    }
}