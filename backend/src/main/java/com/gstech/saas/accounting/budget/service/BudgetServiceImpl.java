package com.gstech.saas.accounting.budget.service;

import com.gstech.saas.accounting.budget.dto.*;
import com.gstech.saas.accounting.budget.model.Budget;
import com.gstech.saas.accounting.budget.model.BudgetLineItem;
import com.gstech.saas.accounting.budget.repository.BudgetRepository;
import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CoaRepository    coaRepository;
    private final EntityManager    entityManager;  // ← for flush in replaceLineItems

    // ── Create ────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public BudgetResponse create(CreateBudgetRequest request) {
        Long tenantId = requireTenantId();

        validateDateRange(request.startDate(), request.endDate());

        BudgetStatus status = request.status() != null
                ? request.status() : BudgetStatus.DRAFT;

        if (status == BudgetStatus.ACTIVE) {
            checkNoDuplicateActive(
                    tenantId, request.associationId(),
                    request.fiscalYear(), null);
        }

        Budget budget = Budget.builder()
                .associationId(request.associationId())
                .name(request.name())
                .fiscalYear(request.fiscalYear())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .status(status)
                .notes(request.notes())
                .build();

        // ── Safe null/empty check ─────────────────────────────────────────
        if (request.lineItems() != null && !request.lineItems().isEmpty()) {
            budget.getLineItems().addAll(
                    buildLineItems(tenantId, request.lineItems(), budget));
        }

        return toResponse(tenantId, budgetRepository.save(budget));
    }

    // ── List ──────────────────────────────────────────────────────────────────
    @Override
    public List<BudgetResponse> list(Long associationId, Integer fiscalYear) {
        Long tenantId = requireTenantId();  // resolve ONCE
        return budgetRepository
                .findAllWithFilters(tenantId, associationId, fiscalYear)
                .stream()
                .map(b -> toResponse(tenantId, b))  // pass tenantId down
                .toList();
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────
    @Override
    public BudgetResponse getById(Long id) {
        Long tenantId = requireTenantId();
        return toResponse(tenantId, findForTenant(id, tenantId));
    }

    // ── Update ────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public BudgetResponse update(Long id, UpdateBudgetRequest request) {
        Long tenantId = requireTenantId();
        Budget budget = findForTenant(id, tenantId);

        if (budget.getStatus() == BudgetStatus.CLOSED) {
            throw new IllegalStateException("Cannot update a CLOSED budget");
        }

        validateDateRange(request.startDate(), request.endDate());

        if (request.status() == BudgetStatus.ACTIVE
                && budget.getStatus() != BudgetStatus.ACTIVE) {
            checkNoDuplicateActive(
                    tenantId, request.associationId(),
                    request.fiscalYear(), id);
        }

        budget.setAssociationId(request.associationId());
        budget.setName(request.name());
        budget.setFiscalYear(request.fiscalYear());
        budget.setStartDate(request.startDate());
        budget.setEndDate(request.endDate());
        budget.setStatus(request.status());
        budget.setNotes(request.notes());

        return toResponse(tenantId, budgetRepository.save(budget));
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public void delete(Long id) {
        Long tenantId = requireTenantId();
        Budget budget = findForTenant(id, tenantId);

        if (budget.getStatus() == BudgetStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Cannot delete an ACTIVE budget. Close it first.");
        }

        budgetRepository.delete(budget);
    }

    // ── Get line items ────────────────────────────────────────────────────────
    @Override
    public List<BudgetLineItemResponse> getLineItems(Long budgetId) {
        Long tenantId = requireTenantId();
        Budget budget = findForTenant(budgetId, tenantId);
        return toLineItemResponses(tenantId, budget.getLineItems());
    }

    // ── Replace line items ────────────────────────────────────────────────────
    @Override
    @Transactional
    public List<BudgetLineItemResponse> replaceLineItems(
            Long budgetId,
            List<BudgetLineItemRequest> requests
    ) {
        Long tenantId = requireTenantId();
        Budget budget = findForTenant(budgetId, tenantId);

        if (budget.getStatus() == BudgetStatus.CLOSED) {
            throw new IllegalStateException(
                    "Cannot modify line items of a CLOSED budget");
        }

        // Clear + flush so orphanRemoval fires BEFORE new inserts
        // prevents potential unique constraint conflicts on re-insert
        budget.getLineItems().clear();
        entityManager.flush();

        if (requests != null && !requests.isEmpty()) {
            budget.getLineItems().addAll(
                    buildLineItems(tenantId, requests, budget));
        }

        Budget saved = budgetRepository.save(budget);
        return toLineItemResponses(tenantId, saved.getLineItems());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Long requireTenantId() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context not found");
        }
        return tenantId;
    }

    private Budget findForTenant(Long id, Long tenantId) {
        return budgetRepository
                .findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Budget not found: " + id));
    }

    private void validateDateRange(
            java.time.LocalDate start,
            java.time.LocalDate end
    ) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new IllegalArgumentException(
                    "End date must be after start date");
        }
    }

    private void checkNoDuplicateActive(
            Long tenantId, Long associationId,
            Integer fiscalYear, Long excludeId
    ) {
        // Uses corrected COUNT query — compare Long not boolean
        Long count = budgetRepository.countActiveBudget(
                tenantId, associationId, fiscalYear, excludeId,BudgetStatus.ACTIVE );
        if (count != null && count > 0) {
            throw new IllegalStateException(
                    "An ACTIVE budget already exists for fiscal year "
                            + fiscalYear + ". Close it before activating another.");
        }
    }

    private List<BudgetLineItem> buildLineItems(
            Long tenantId,
            List<BudgetLineItemRequest> requests,
            Budget budget
    ) {
        Set<Long> accountIds = requests.stream()
                .map(BudgetLineItemRequest::accountId)
                .collect(Collectors.toSet());

        Set<Long> validIds = coaRepository
                .findByTenantIdAndIdInAndIsDeletedFalse(tenantId, accountIds)
                .stream()
                .map(Coa::getId)
                .collect(Collectors.toSet());

        Set<Long> invalidIds = accountIds.stream()
                .filter(id -> !validIds.contains(id))
                .collect(Collectors.toSet());

        if (!invalidIds.isEmpty()) {
            throw new EntityNotFoundException(
                    "Account IDs not found or deleted: " + invalidIds);
        }

        return requests.stream()
                .map(req -> BudgetLineItem.builder()
                        .budget(budget)
                        .accountId(req.accountId())
                        .budgetedAmount(req.budgetedAmount())
                        .notes(req.notes())
                        .build())
                .toList();
    }

    // tenantId passed in — resolved once by caller, not re-fetched per item
    private BudgetResponse toResponse(Long tenantId, Budget budget) {
        return new BudgetResponse(
                budget.getId(),
                budget.getAssociationId(),
                budget.getName(),
                budget.getFiscalYear(),
                budget.getStartDate(),
                budget.getEndDate(),
                budget.getStatus().name(),
                budget.getNotes(),
                toLineItemResponses(tenantId, budget.getLineItems())
        );
    }

    private List<BudgetLineItemResponse> toLineItemResponses(
            Long tenantId,
            List<BudgetLineItem> lineItems
    ) {
        if (lineItems == null || lineItems.isEmpty()) return List.of();

        Set<Long> accountIds = lineItems.stream()
                .map(BudgetLineItem::getAccountId)
                .collect(Collectors.toSet());

        Map<Long, Coa> coaMap = coaRepository
                .findByTenantIdAndIdInAndIsDeletedFalse(tenantId, accountIds)
                .stream()
                .collect(Collectors.toMap(Coa::getId, Function.identity()));

        return lineItems.stream()
                .map(item -> {
                    Coa coa = coaMap.get(item.getAccountId());
                    return new BudgetLineItemResponse(
                            item.getId(),
                            item.getAccountId(),
                            coa != null ? coa.getAccountCode() : null,
                            coa != null ? coa.getAccountName()  : null,
                            item.getBudgetedAmount(),
                            item.getNotes()
                    );
                })
                .toList();
    }
}