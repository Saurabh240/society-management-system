package com.gstech.saas.accounting.bills.dto;

import java.math.BigDecimal;

public record BillSummaryResponse(
        Long totalBills,
        BigDecimal totalAmount,
        BigDecimal unpaidAmount,
        BigDecimal overdueAmount
) {}