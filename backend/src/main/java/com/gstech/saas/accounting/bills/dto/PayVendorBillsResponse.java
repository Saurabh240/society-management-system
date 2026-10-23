package com.gstech.saas.accounting.bills.dto;

import com.gstech.saas.accounting.bills.model.BillStatus;

import java.math.BigDecimal;
import java.util.List;

public record PayVendorBillsResponse(
        BigDecimal totalApplied,
        List<Allocation> allocations
) {
    public record Allocation(
            Long billId,
            String billNumber,
            BigDecimal amountApplied,
            BigDecimal remainingBalance,
            BillStatus status
    ) {}
}