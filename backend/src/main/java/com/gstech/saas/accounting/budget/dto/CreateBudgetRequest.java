package com.gstech.saas.accounting.budget.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CreateBudgetRequest(
        Long associationId,         // optional

        @NotBlank(message = "Budget name is required")
        String name,

        @NotNull(message = "Fiscal year is required")
        Integer fiscalYear,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        BudgetStatus status,        // optional, defaults to DRAFT

        String notes,

        @Valid
        List<BudgetLineItemRequest> lineItems
) {}