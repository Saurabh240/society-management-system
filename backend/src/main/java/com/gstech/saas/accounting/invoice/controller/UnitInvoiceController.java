package com.gstech.saas.accounting.invoice.controller;

import com.gstech.saas.accounting.invoice.dto.*;
import com.gstech.saas.accounting.invoice.service.UnitInvoiceService;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/units/{unitId}/invoices")
@RequiredArgsConstructor
@Tag(name = "Unit Invoices", description = "Charge owners for HOA fees and assessments")
public class UnitInvoiceController {

    private final UnitInvoiceService invoiceService;

    @Operation(
            summary = "Create invoice for a unit",
            description = "Charges an owner by creating an income journal entry (DEBIT Accounts Receivable, CREDIT Income accounts) and increases unit balance."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceResponse>> create(
            @PathVariable Long unitId,
            @Valid @RequestBody CreateInvoiceRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(invoiceService.create(unitId, request)));
    }

    @Operation(
            summary = "List invoices for a unit",
            description = "Returns all invoices for the specified unit, ordered by invoice date descending."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> list(
            @PathVariable Long unitId) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.list(unitId)));
    }

    @Operation(summary = "Record a payment against an invoice",
            description = "Posts Dr Cash / Cr AR / Cr Income (prorated), as a separate journal entry from the original charge.")
    @PostMapping("/{invoiceId}/payments")
    public ResponseEntity<ApiResponse<InvoicePaymentResponse>> recordPayment(
            @PathVariable Long unitId,
            @PathVariable Long invoiceId,
            @Valid @RequestBody RecordInvoicePaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(invoiceService.recordPayment(invoiceId, request)));
    }

    @Operation(summary = "Get payment history for an invoice")
    @GetMapping("/{invoiceId}/payments")
    public ResponseEntity<ApiResponse<List<InvoicePaymentResponse>>> getPayments(
            @PathVariable Long unitId,
            @PathVariable Long invoiceId) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getPayments(invoiceId)));
    }
}