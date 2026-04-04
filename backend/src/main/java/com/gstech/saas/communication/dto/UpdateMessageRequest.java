package com.gstech.saas.communication.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;

@Data
public class UpdateMessageRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;

    /** If provided, message will be scheduled; otherwise sent immediately */
    private Instant scheduledAt;

    /** Optional: swap the template used by this message */
    private Long templateId;
}