package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.service.CommunicationServiceImpl;
import com.gstech.saas.communication.service.MailingService;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/communications/mailings")
@Tag(name = "Mailing", description = "Mailing APIs")
@RequiredArgsConstructor
public class MailingController {

    private final MailingService mailingService;

    /**
     * GET /api/communications/mailings?tenantId=1&page=0&size=20
     * Populates the Mailings list tab.
     */
    @GetMapping
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
}