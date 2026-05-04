package com.gstech.saas.accounting.bills.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record PayBillRequest(
        @NotNull(message = "Bank account is required")
        Long bankAccountId,

        @NotNull(message = "Payment date is required")
        LocalDate paymentDate,

         @NotNull(message = "Accounts Payable account is required")
        Long apAccountId,

        @NotNull(message = "Cash account is required")
        Long cashAccountId
) {}