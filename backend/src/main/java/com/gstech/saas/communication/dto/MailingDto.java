package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class MailingDto {

    private Long id;

    private String title;

    private String recipientLabel;

    private Instant date;

    private MessageStatus status;
}