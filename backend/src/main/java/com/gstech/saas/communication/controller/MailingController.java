package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.service.MailingPdfService;
import com.gstech.saas.communication.service.MailingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/communications/mailings")
@Tag(name = "Mailing", description = "Mailing APIs")
@RequiredArgsConstructor
public class MailingController {

    private final MailingService mailingService;
    private final MailingPdfService mailingPdfService;

    /**
     * GET /api/communications/mailings?tenantId=1&page=0&size=20
     * Populates the Mailings list tab.
     */
    @GetMapping
    public ResponseEntity<Page<MailingDto>> listMailings(
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(mailingService.listMailings(pageable));
    }

    /**
     * GET /api/communications/mailings/{id}
     * Populates the Edit Mailing form — returns full detail including
     * selected ownerIds, template info, and current content.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MailingDetailDto> getMailingById(@PathVariable Long id) {
        return ResponseEntity.ok(mailingService.getMailingById(id));
    }

    /**
     * POST /api/communications/mailings
     * Create Mailing form "Create Mailing" button.
     */
    @PostMapping
    public ResponseEntity<Long> createMailing(
            @Valid @RequestBody CreateMailingRequest request) {

        return ResponseEntity.ok(mailingService.createMailing(request));
    }

    /**
     * PUT /api/communications/mailings/{id}
     * Edit Mailing form "Update Mailing" button.
     * Replaces recipients and deliveries entirely.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateMailing(
            @PathVariable Long id,
            @Valid @RequestBody CreateMailingRequest request) {

        mailingService.updateMailing(id, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/communications/mailings/{id}
     * "Delete" action button in the list.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMailing(@PathVariable Long id) {
        mailingService.deleteMailing(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete multiple mailings")
    @DeleteMapping("/batch")
    public void deleteMailingsByIds(@RequestBody List<Long> ids) {
        mailingService.deleteMailingsByIds(ids);
    }

    /**
     * Preview or download a single recipient's PDF.
     * GET /api/v1/communications/mailings/{id}/pdf/{ownerId}
     *
     * ?download=true  → Content-Disposition: attachment (triggers browser download)
     * ?download=false → Content-Disposition: inline  (renders in browser/preview tab)
     */
    @GetMapping("/{id}/pdf/{ownerId}")
    public ResponseEntity<byte[]> getRecipientPdf(
            @PathVariable Long id,
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "false") boolean download) {

        byte[] pdf = mailingPdfService.generateForOwner(id, ownerId);
        String disposition = download ? "attachment" : "inline";
        String filename = "mailing_" + id + "_owner_" + ownerId + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        disposition + "; filename=\"" + filename + "\"")
                .body(pdf);
    }

    /**
     * Download all recipient PDFs as a ZIP.
     * GET /api/v1/communications/mailings/{id}/pdf/all
     */
    @GetMapping("/{id}/pdf/all")
    public ResponseEntity<byte[]> getAllPdfs(@PathVariable Long id) throws IOException {
        byte[] zip = mailingPdfService.generateAllAsZip(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/zip")
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"mailing_" + id + "_all.zip\"")
                .body(zip);
    }
}