package com.gstech.saas.accounting.invoice.dto;

import java.math.BigDecimal;

public record InvoiceLineItemResponse(
        Long id,
        String description,
        Long incomeAccountId,
        String incomeAccountName,
        BigDecimal amount
) {}