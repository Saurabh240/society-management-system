package com.gstech.saas.communication.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessageDto {

    private Long id;

    /** Display subject (emails/SMS) or title (mailings) */
    private String subject;

    /** Human-readable recipient label, e.g. "All Residents", "Board Members" */
    private String recipientLabel;

    /** Time the message was sent or is scheduled to be sent */
    private Instant date;

    /** DRAFT | SCHEDULED | SENT | DELIVERED */
    private MessageStatus status;

    /** EMAIL | SMS | MAILING */
    private Channel channel;

    /** Aggregate delivery status summary (populated for SENT/SCHEDULED messages) */
    @JsonProperty("delivery_status")
    private DeliveryStatusSummary deliveryStatus;
}
