package com.gstech.saas.accounting.budget.service;

import com.gstech.saas.accounting.budget.dto.*;

import java.util.List;

public interface BudgetService {

    BudgetResponse create(CreateBudgetRequest request);

    List<BudgetResponse> list(Long associationId, Integer fiscalYear);

    BudgetResponse getById(Long id);

    BudgetResponse update(Long id, UpdateBudgetRequest request);

    void delete(Long id);

    List<BudgetLineItemResponse> getLineItems(Long budgetId);

    List<BudgetLineItemResponse> replaceLineItems(
            Long budgetId,
            List<BudgetLineItemRequest> lineItems
    );
}