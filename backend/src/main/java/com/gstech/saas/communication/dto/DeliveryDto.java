package com.gstech.saas.communication.dto;

import java.time.Instant;
import java.time.LocalDateTime;

public record DeliveryDto(
        Long id,
        Long messageId,
        String recipientIdentifier,
        String email,
        String phone,
        DeliveryStatus status,
        Integer retryCount,
        String errorMessage,
        LocalDateTime deliveredAt
) {}
