package com.gstech.saas.communication.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Details of a failed delivery for a specific recipient.
 */
@Data
@Builder
public class FailedDeliveryDetail {

    @JsonProperty("recipient_identifier")
    private String recipientIdentifier;

    private String email;

    private String phone;

    private DeliveryStatus status;

    @JsonProperty("retry_count")
    private Integer retryCount;

    @JsonProperty("error_message")
    private String errorMessage;

    @JsonProperty("delivered_at")
    private LocalDateTime deliveredAt;
}
