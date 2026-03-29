package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
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
}