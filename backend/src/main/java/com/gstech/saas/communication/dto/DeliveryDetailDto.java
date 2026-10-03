package com.gstech.saas.communication.dto;

import java.time.LocalDateTime;

public record DeliveryDetailDto(
        Long id,
        String recipient,
        DeliveryStatus status,
        Integer retryCount,
        String errorMessage,
        LocalDateTime deliveredAt
) {}
