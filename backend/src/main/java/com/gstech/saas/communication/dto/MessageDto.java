package com.gstech.saas.communication.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MessageDto {

    private Long id;

    /** Display subject (emails/SMS) or title (mailings) */
    private String subject;

    /** Human-readable recipient label, e.g. "All Residents", "Board Members" */
    private RecipientType recipientLabel;

    /** Time the message was sent or is scheduled to be sent */
    private Instant date;

    /** DRAFT | SCHEDULED | SENT | DELIVERED */
    private MessageStatus status;

    /** EMAIL | SMS | MAILING */
    private Channel channel;
}
