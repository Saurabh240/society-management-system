package com.gstech.saas.accounting.bills.dto;

import com.gstech.saas.accounting.bills.model.BillStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record BillResponse(
        Long id,
        String billNumber,
        Long vendorId,
        Long associationId,
        LocalDate issueDate,
        LocalDate dueDate,
        BillStatus status,
        BigDecimal totalAmount,
        String memo,
        Instant paidAt,
        String bankAccountName,
        List<BillLineItemResponse> lineItems
) {}
