package com.gstech.saas.accounting.invoice.dto;

import com.gstech.saas.accounting.invoice.model.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record InvoiceResponse(
        Long id,
        Long unitId,
        String unitNumber,
        Long associationId,
        LocalDate invoiceDate,
        LocalDate dueDate,
        BigDecimal totalAmount,
        BigDecimal amountPaid,
        BigDecimal remainingBalance,
        InvoiceStatus status,
        String notes,
        List<InvoiceLineItemResponse> lineItems,
        Instant createdAt
) {}