package com.gstech.saas.accounting.invoice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RecordInvoicePaymentRequest(
        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount,

        @NotNull(message = "Payment date is required")
        LocalDate paymentDate,

        @NotNull(message = "Bank account is required")
        Long bankAccountId,

        Long cashAccountId,

        String memo,

        String idempotencyKey
) {}