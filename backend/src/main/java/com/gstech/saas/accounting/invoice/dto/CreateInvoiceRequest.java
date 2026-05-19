package com.gstech.saas.accounting.invoice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record CreateInvoiceRequest(

        @NotNull(message = "Invoice date is required")
        LocalDate invoiceDate,

        @NotNull(message = "Due date is required")
        LocalDate dueDate,

        @NotEmpty(message = "At least one line item is required")
        @Valid
        List<InvoiceLineItemRequest> lineItems,

        String notes
) {}