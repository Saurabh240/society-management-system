package com.gstech.saas.communication.dto;

import java.util.Map;

/**
 * Request for the template resolve endpoint (POST /api/v1/communications/templates/resolve).
 *
 * Variable resolution has two phases:
 *
 * 1. COMPOSE-TIME (this endpoint):
 *    Resolves static variables like {{associationName}}, {{date}}, {{subject}}.
 *    Pass these in the 'variables' map.
 *    Per-recipient variables ({{ownerName}}, {{unitNumber}}, {{email}}) are NOT
 *    resolved here unless previewOwnerId is provided.
 *
 * 2. SEND-TIME (handled automatically per-recipient by OwnerVariableResolver):
 *    When a message is dispatched via Kafka, each recipient's delivery record
 *    is processed individually — {{ownerName}}, {{unitNumber}}, {{email}} are
 *    replaced with the actual owner's data at that point.
 *
 * If you want to preview what the message will look like for a specific owner,
 * set previewOwnerId to that owner's ID. The resolve endpoint will then also
 * resolve per-recipient variables for that owner.
 * If previewOwnerId is null, per-recipient placeholders like {{ownerName}} will
 * appear literally in the resolved output — this is expected and correct.
 */
public record TemplateEngineRequest(
        Long templateId,

        /**
         * Static variables to substitute at compose time.
         * Common keys: "associationName", "date", "subject"
         * Per-recipient keys (ownerName, unitNumber, email) can be included here
         * for testing, but are automatically resolved per-recipient at send time.
         */
        Map<String, String> variables,

        /**
         * Optional. When provided, the resolve endpoint will also resolve
         * per-recipient variables ({{ownerName}}, {{unitNumber}}, {{email}})
         * for this specific owner — useful for compose-time preview.
         * When null, per-recipient variables remain as literal {{placeholders}}.
         */
        Long previewOwnerId
) {}