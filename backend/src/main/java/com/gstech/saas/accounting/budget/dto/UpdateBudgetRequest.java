package com.gstech.saas.accounting.budget.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record UpdateBudgetRequest(
        Long associationId,

        @NotBlank(message = "Budget name is required")
        String name,

        @NotNull(message = "Fiscal year is required")
        Integer fiscalYear,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @NotNull(message = "Status is required")
        BudgetStatus status,

        String notes
) {}