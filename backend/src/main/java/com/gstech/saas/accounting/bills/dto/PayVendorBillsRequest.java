package com.gstech.saas.accounting.bills.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Flexible vendor payment: pay any amount and let the system spread it across the
 * vendor's open bills (oldest due date first). If {@code firstBillId} is given, that
 * bill is settled first and any remainder rolls on to the other open bills.
 */
public record PayVendorBillsRequest(
        @NotNull(message = "Vendor is required")
        Long vendorId,

        @NotNull(message = "Association is required")
        Long associationId,

        @NotNull(message = "Bank account is required")
        Long bankAccountId,

        @NotNull(message = "Payment date is required")
        LocalDate paymentDate,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount,

        Long firstBillId,
        Long apAccountId,
        Long cashAccountId
) {}