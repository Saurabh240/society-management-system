package com.gstech.saas.accounting.invoice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecordUnitPaymentResponse(
        Long unitId,
        BigDecimal amountApplied,
        LocalDate paymentDate,
        BigDecimal remainingBalance
) {}
