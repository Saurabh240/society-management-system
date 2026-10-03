package com.gstech.saas.accounting.bills.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BillPaymentResponse(
        Long id,
        BigDecimal amount,
        LocalDate paymentDate,
        Long bankAccountId,
        String bankAccountName
) {}