package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class MailingDto {

    private Long id;

    /** "Annual Report 2025" — shown in Title column */
    private String title;

    /** "Sunset Village (2 owners)" — shown in Recipient column */
    private RecipientType recipientLabel;

    private Instant date;

    private MessageStatus status;
}