package com.gstech.saas.accounting.bills.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CreateBillRequest(
        String billNumber,

        @NotNull(message = "Vendor is required")
        Long vendorId,

        @NotNull(message = "Association is required")
        Long associationId,

        @NotNull(message = "Issue date is required")
        LocalDate issueDate,

        @NotNull(message = "Due date is required")
        LocalDate dueDate,

        String memo,

        @NotEmpty(message = "Bill must contain at least one line item")
        @Valid
        List<BillLineItemRequest> lineItems
) {}