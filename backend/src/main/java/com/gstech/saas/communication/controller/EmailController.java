package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.service.EmailService;
import com.gstech.saas.communication.service.RecipientOptionsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/communications/emails")
@Tag(name = "Email", description = "Email APIs")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService service;

    /**
     * Create and send (or schedule) an email.
     * If request.scheduledAt is present → status = SCHEDULED
     * Otherwise                          → status = SENT + publish to Kafka
     */
    @PostMapping
    public ResponseEntity<Long> sendEmail(
            @Valid @RequestBody CreateMessageRequest request) {

        Long id = service.sendEmail(request);
        return ResponseEntity.ok(id);
    }

    /**
     * List all emails for a tenant, paginated.
     * GET /api/communications/emails?tenantId=1&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<Page<MessageDto>> listEmails(
            @RequestParam Long tenantId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(service.listEmails(tenantId, pageable));
    }

    /**
     * Get full detail of a single email by ID.
     * Used to populate the view/preview panel when clicking an email subject in the list.
     * GET /api/v1/communications/emails/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get email by ID", description = "Returns full email detail including recipient label, status, body and delivery info")
    public ResponseEntity<MessageDetailDto> getEmail(@PathVariable Long id) {
        return ResponseEntity.ok(service.getEmail(id));
    }

    /**
     * Edit subject/body/scheduledAt of an existing email.
     * Only allowed when status = DRAFT or SCHEDULED.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Void> editEmail(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMessageRequest request) {

        service.updateEmail(id, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Resend a previously sent email by creating new deliveries.
     */
    @PostMapping("/{id}/resend")
    public ResponseEntity<Void> resendEmail(@PathVariable Long id) {
        service.resendEmail(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Reschedule a SCHEDULED email to a new date/time.
     */
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<Void> rescheduleEmail(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {

        service.rescheduleEmail(id, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Soft-delete an email message and its deliveries.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmail(@PathVariable Long id) {
        service.deleteEmail(id);
        return ResponseEntity.noContent().build();
    }
}