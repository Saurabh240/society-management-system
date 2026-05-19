package com.gstech.saas.accounting.invoice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record InvoiceLineItemRequest(

        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Income account is required")
        Long incomeAccountId,

        @NotNull
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount
) {}