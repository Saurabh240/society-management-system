package com.gstech.saas.accounting.invoice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request body for "Receive Payment" against a unit's outstanding balance
 * (frontend: UnitLedgerPage.jsx -> recordUnitPayment). Not tied to a single
 * invoice id — the payment is applied FIFO across the unit's outstanding
 * invoices, oldest first, same way a real HOA applies an owner's check.
 */
public record RecordUnitPaymentRequest(

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount,

        @NotNull(message = "Payment date is required")
        LocalDate paymentDate,

        @NotNull(message = "Bank account is required")
        Long bankAccountId,

        String referenceNumber,

        String memo
) {}
