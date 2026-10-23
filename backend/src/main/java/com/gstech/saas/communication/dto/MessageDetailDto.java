package com.gstech.saas.communication.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessageDetailDto {

    private Long id;
    private String subject;
    private String body;
    private String recipientLabel;
    private Instant sentAt;
    private Instant scheduledAt;
    private Instant createdAt;
    private MessageStatus status;
    private Channel channel;
    private Long templateId;

    /** Aggregate delivery status summary (populated for sent messages) */
    @JsonProperty("delivery_status")
    private DeliveryStatusSummary deliveryStatus;
}