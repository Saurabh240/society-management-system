package com.gstech.saas.accounting.budget.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record BudgetRequest(
        Long associationId,       // optional — null = applies to all associations

        @NotBlank(message = "Budget name is required")
        String name,

        @NotNull(message = "Fiscal year is required")
        @Min(value = 2000, message = "Fiscal year must be 2000 or later")
        Integer fiscalYear,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        String notes,

        @Valid
        List<BudgetLineItemRequest> lineItems
) {}