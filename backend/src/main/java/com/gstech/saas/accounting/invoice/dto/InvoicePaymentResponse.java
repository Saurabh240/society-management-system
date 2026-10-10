package com.gstech.saas.accounting.invoice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoicePaymentResponse(
        Long id,
        BigDecimal amount,
        LocalDate paymentDate,
        Long bankAccountId,
        String bankAccountName,
        String memo
) {}