package com.gstech.saas.accounting.reports.dto;

import com.gstech.saas.accounting.invoice.model.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssessmentHistoryRow(
        Long invoiceId,
        String associationName,
        String unitNumber,
        String ownerName,
        LocalDate invoiceDate,
        LocalDate dueDate,
        BigDecimal amount,
        InvoiceStatus status
) {}