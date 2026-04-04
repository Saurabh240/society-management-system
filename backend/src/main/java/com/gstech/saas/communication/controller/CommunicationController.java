package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.service.CommunicationService;
import com.gstech.saas.communication.service.RecipientOptionsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/communications")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationService communicationService;
    private final RecipientOptionsService recipientOptionsService;

    /**
     * GET /api/communications/owners?associationId=10
     * Called when an association is selected on the form.
     * Returns the checkbox list of owners with unit numbers.
     */
    @GetMapping("/owners")
    public ResponseEntity<List<OwnerDto>> getOwnersByAssociation(
            @RequestParam Long associationId) {

        return ResponseEntity.ok(communicationService.getOwnersByAssociation(associationId));
    }

    @GetMapping("/recipients/options")
    public ResponseEntity<RecipientOptionsResponse> getRecipientOptions(
            @RequestParam(required = false) Long associationId) {

        return ResponseEntity.ok(
                recipientOptionsService.getOptions(associationId));
    }
}