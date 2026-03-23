package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.service.CommunicationServiceImpl;
import com.gstech.saas.communication.service.MailingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/communications")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationServiceImpl service;
    private final MailingService mailingService;

    // ─────────────────────────────────────────────────
    // EMAIL ENDPOINTS
    // ─────────────────────────────────────────────────

    /**
     * Create and send (or schedule) an email.
     * If request.scheduledAt is present → status = SCHEDULED
     * Otherwise                          → status = SENT + publish to Kafka
     */
    @PostMapping("/emails")
    public ResponseEntity<Long> sendEmail(
            @Valid @RequestBody CreateMessageRequest request) {

        Long id = service.sendEmail(request);
        return ResponseEntity.ok(id);
    }

    /**
     * List all emails for a tenant, paginated.
     * GET /api/communications/emails?tenantId=1&page=0&size=20
     */
    @GetMapping("/emails")
    public ResponseEntity<Page<MessageDto>> listEmails(
            @RequestParam Long tenantId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(service.listEmails(tenantId, pageable));
    }

    /**
     * Edit subject/body/scheduledAt of an existing email.
     * Only allowed when status = DRAFT or SCHEDULED.
     */
    @PutMapping("/emails/{id}")
    public ResponseEntity<Void> editEmail(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMessageRequest request) {

        service.updateEmail(id, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Resend a previously sent email by creating new deliveries.
     */
    @PostMapping("/emails/{id}/resend")
    public ResponseEntity<Void> resendEmail(@PathVariable Long id) {
        service.resendEmail(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Reschedule a SCHEDULED email to a new date/time.
     */
    @PutMapping("/emails/{id}/reschedule")
    public ResponseEntity<Void> rescheduleEmail(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {

        service.rescheduleEmail(id, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Soft-delete an email message and its deliveries.
     */
    @DeleteMapping("/emails/{id}")
    public ResponseEntity<Void> deleteEmail(@PathVariable Long id) {
        service.deleteEmail(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/communications/mailings?tenantId=1&page=0&size=20
     * Populates the Mailings list tab.
     */
    @GetMapping("/mailings")
    public ResponseEntity<Page<MailingDto>> listMailings(
            @RequestParam Long tenantId,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(mailingService.listMailings(tenantId, pageable));
    }

    /**
     * GET /api/communications/mailings/{id}
     * Populates the Edit Mailing form — returns full detail including
     * selected ownerIds, template info, and current content.
     */
    @GetMapping("/mailings/{id}")
    public ResponseEntity<MailingDetailDto> getMailingById(@PathVariable Long id) {
        return ResponseEntity.ok(mailingService.getMailingById(id));
    }

    /**
     * POST /api/communications/mailings
     * Create Mailing form "Create Mailing" button.
     */
    @PostMapping("/mailings")
    public ResponseEntity<Long> createMailing(
            @Valid @RequestBody CreateMailingRequest request) {

        return ResponseEntity.ok(mailingService.createMailing(request));
    }

    /**
     * PUT /api/communications/mailings/{id}
     * Edit Mailing form "Update Mailing" button.
     * Replaces recipients and deliveries entirely.
     */
    @PutMapping("/mailings/{id}")
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
    @DeleteMapping("/mailings/{id}")
    public ResponseEntity<Void> deleteMailing(@PathVariable Long id) {
        mailingService.deleteMailing(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/communications/mailings/owners?associationId=10
     * Called when an association is selected on the form.
     * Returns the checkbox list of owners with unit numbers.
     */
    @GetMapping("/mailings/owners")
    public ResponseEntity<List<OwnerDto>> getOwnersByAssociation(
            @RequestParam Long associationId) {

        return ResponseEntity.ok(mailingService.getOwnersByAssociation(associationId));
    }
}