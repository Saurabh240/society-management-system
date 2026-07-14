package com.gstech.saas.accounting.budget.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record BudgetResponse(
        Long       id,
        Long       associationId,
        String     name,
        Integer    fiscalYear,
        LocalDate  startDate,
        LocalDate  endDate,
        String     status,
        String     notes,
        Instant    createdAt,
        List<BudgetLineItemResponse> lineItems
) {}