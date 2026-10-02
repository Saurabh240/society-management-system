package com.gstech.saas.accounting.bills.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PayBillRequest(
        @NotNull(message = "Bank account is required")
        Long bankAccountId,

        @NotNull(message = "Payment date is required")
        LocalDate paymentDate,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount,

        Long apAccountId,

        Long cashAccountId
) {}