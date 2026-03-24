package com.gstech.saas.communication.dto;

import java.time.Instant;


public record CreateSmsRequest(
        String message,
        Long associationId,
        RecipientRequest recipient,
        Instant scheduleAt
) {}
