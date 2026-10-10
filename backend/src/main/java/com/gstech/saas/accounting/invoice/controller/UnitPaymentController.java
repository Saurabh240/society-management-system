package com.gstech.saas.accounting.invoice.controller;

import com.gstech.saas.accounting.invoice.dto.InvoicePaymentResponse;
import com.gstech.saas.accounting.invoice.dto.RecordInvoicePaymentRequest;
import com.gstech.saas.accounting.invoice.service.UnitInvoiceService;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * "Receive Payment" against a unit's outstanding balance. The frontend
 * (UnitLedgerPage.jsx -> unitLedgerApi.recordUnitPayment) already posts to
 * this exact path - this release's regression was that no backend route
 * existed here at all, so every submission 404'd. The payment is not tied to
 * a single invoice id: UnitInvoiceService.recordPayment() applies it FIFO
 * across the unit's outstanding invoices, oldest first.
 */
@RestController
@RequestMapping("/api/v1/units/{unitId}/payments")
@RequiredArgsConstructor
@Tag(name = "Unit Payments", description = "Record owner payments against a unit's outstanding balance")
public class UnitPaymentController {

    private final UnitInvoiceService invoiceService;

    @Operation(
            summary = "Record a payment for a unit",
            description = "Applies the payment FIFO across the unit's outstanding invoices (oldest first), "
                    + "clears the receivable (ACCRUAL), recognizes income now (CASH), and records the cash "
                    + "arriving in the selected bank account (BOTH)."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<InvoicePaymentResponse>> recordPayment(
            @PathVariable Long unitId,
            @Valid @RequestBody RecordInvoicePaymentRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(invoiceService.recordPayment(unitId, request)));
    }
}
