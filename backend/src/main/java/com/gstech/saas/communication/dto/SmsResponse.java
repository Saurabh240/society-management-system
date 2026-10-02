package com.gstech.saas.communication.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record SmsResponse(
        Long id,
        String message,
        String recipient,
        List<String> phoneNumbers,
        Instant date,
        MessageStatus status,
        @JsonProperty("delivery_status")
        DeliveryStatusSummary deliveryStatus
) {}

