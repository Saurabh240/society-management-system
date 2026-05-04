package com.gstech.saas.accounting.bills.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BillLineItemRequest(
        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Expense account is required")
        Long expenseAccountId,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount
) {}