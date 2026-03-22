package com.gstech.saas.communication.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
public class CreateMessageRequest {

    @NotNull(message = "Tenant ID is required")
    private Long tenantId;

    private Long associationId;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;

    @NotNull(message = "Channel is required")
    private Channel channel;

    @NotNull(message = "Recipient is required")
    @Valid
    private RecipientRequest recipient;

    /** Optional: pre-fill subject/body from a saved template */
    private Long templateId;

    /**
     * If set, message will be persisted as SCHEDULED and dispatched
     * by the scheduler at this time. If null, sent immediately.
     */
    private Instant scheduledAt;
}
