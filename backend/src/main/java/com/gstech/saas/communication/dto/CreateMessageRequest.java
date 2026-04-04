package com.gstech.saas.communication.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateMessageRequest {

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

    private Long templateId;

    private Instant scheduledAt;
}
