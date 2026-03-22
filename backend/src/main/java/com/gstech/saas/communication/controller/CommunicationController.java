package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.CreateMessageRequest;
import com.gstech.saas.communication.dto.MessageDto;
import com.gstech.saas.communication.dto.RescheduleRequest;
import com.gstech.saas.communication.dto.UpdateMessageRequest;
import com.gstech.saas.communication.service.CommunicationServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/communications")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationServiceImpl service;

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
}