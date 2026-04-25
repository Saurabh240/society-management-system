package com.gstech.saas.accounting.bills.controller;

import com.gstech.saas.accounting.bills.dto.*;
import com.gstech.saas.accounting.bills.model.BillStatus;
import com.gstech.saas.accounting.bills.service.BillAttachmentService;
import com.gstech.saas.accounting.bills.service.BillService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accounting/bills")
@RequiredArgsConstructor
@Tag(name = "Bills", description = "Vendor bill management APIs. Create, update, pay and filter bills.")
public class BillController {

    private final BillService billService;
    private final BillAttachmentService attachmentService;

    /* ===============================
      LIST / FILTER BILLS
      =============================== */
    @Operation(
            summary = "Get / Filter Bills",
            description = "Returns paginated list of bills. Filters supported: associationId, status, issue date range."
    )
    @GetMapping
    public Page<BillResponse> list(
            @Parameter(description = "Filter by Association ID")
            @RequestParam(required = false) Long associationId,

            @Parameter(description = "Filter by Bill Status (UNPAID, PAID, OVERDUE)")
            @RequestParam(required = false) BillStatus status,

            @Parameter(description = "Filter bills issued from this date (yyyy-MM-dd)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @Parameter(description = "Filter bills issued up to this date (yyyy-MM-dd)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to,

            Pageable pageable
    ) {
        return billService.list(associationId, status, from, to, pageable);
    }

     /* ===============================
       CREATE BILL
       =============================== */
    @Operation(
            summary = "Create Bill",
            description = "Creates a new vendor bill. Bill number is auto-generated if not provided."
    )
    @PostMapping
    public BillResponse create(@RequestBody CreateBillRequest request) {
        return billService.create(request);
    }

    /* ===============================
      UPDATE BILL
      =============================== */
    @Operation(
            summary = "Update Bill",
            description = "Updates an existing bill. Paid bills cannot be modified."
    )
    @PutMapping("/{id}")
    public BillResponse update( @Parameter(description = "Bill ID", required = true)
                                    @PathVariable Long id,
                               @RequestBody CreateBillRequest request) {
        return billService.update(id, request);
    }

    @Operation(
            summary = "Get Bill By ID",
            description = "Fetch bill by its ID"
    )
    @GetMapping("/{id}")
    public BillResponse getById(
            @Parameter(description = "Bill ID", required = true)
            @PathVariable Long id) {
        return billService.getById(id);
    }

    /* ===============================
      DELETE BILL
      =============================== */
    @Operation(
            summary = "Delete Bill",
            description = "Deletes a bill. Only UNPAID bills can be deleted."
    )
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        billService.delete(id);
    }

    /* ===============================
      PAY BILL
      =============================== */
    @Operation(
            summary = "Pay Bill",
            description = "Marks bill as PAID and automatically creates a Journal Entry in the ledger."
    )
    @PostMapping("/{id}/pay")
    public BillResponse pay(@PathVariable Long id,
                            @RequestBody PayBillRequest request) {
        return billService.pay(id, request);
    }

    /* ===============================
       BILL Summary
      =============================== */
    @Operation(
            summary = "Bill Summary",
            description = "Returns aggregated bill summary including total bills count, total amount, unpaid amount, and overdue amount. Scoped by tenant and optional association filter."
    )
    @GetMapping("/summary")
    public BillSummaryResponse summary(
            @RequestParam(required = false) Long associationId
    ) {
        return billService.getSummary(associationId);
    }
       /* ===================================================
       NEW — ATTACHMENT ENDPOINTS
       =================================================== */
    /**
     * POST /api/v1/accounting/bills/{id}/attachments
     * Upload a file attachment for a bill.
     * Limits: max 5 files, 10 MB each, types: PDF / PNG / JPG
     * Request: multipart/form-data, field name = "file"
     */
    @Operation(summary = "Upload Bill Attachment",

            description = "Attach a file to a bill. Max 5 files per bill, 10MB each. Allowed: PDF, PNG, JPG.")
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public BillAttachmentResponse uploadAttachment(
            @Parameter(description = "Bill ID") @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return attachmentService.upload(id, file);
    }

    /**
     * GET /api/v1/accounting/bills/{id}/attachments
     * List attachment metadata for a bill (no file content).
     */
    @Operation(summary = "List Bill Attachments",

            description = "Returns metadata of all attachments for a bill. Does not return file content.")
    @GetMapping("/{id}/attachments")
    public List<BillAttachmentResponse> listAttachments(
            @Parameter(description = "Bill ID") @PathVariable Long id) {
        return attachmentService.listAttachments(id);
    }

    /**
     * GET /api/v1/accounting/bills/{id}/attachments/{attachmentId}/download
     * Download the actual file content as a binary stream.
     */
    @Operation(summary = "Download Bill Attachment",

            description = "Downloads the file content of a specific attachment.")
    @GetMapping("/{id}/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @Parameter(description = "Bill ID")        @PathVariable Long id,
            @Parameter(description = "Attachment ID")  @PathVariable Long attachmentId) {

        Resource resource = attachmentService.download(id, attachmentId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
