package com.gstech.saas.accounting.bills.dto;

import java.time.LocalDate;
import java.util.List;

public record CreateBillRequest(
        String billNumber,
        Long vendorId,
        Long associationId,
        LocalDate issueDate,
        LocalDate dueDate,
        String memo,
        List<BillLineItemRequest> lineItems
) {}