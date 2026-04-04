package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class MailingDetailDto {

    private Long id;
    private String title;
    private String content;

    private String recipientType;
    private Long associationId;

    /**
     * The specific owner IDs that were selected.
     * Empty list = all owners were targeted.
     */
    private List<Long> ownerIds;

    /** "Sunset Village (2 owners)" */
    private String recipientLabel;

    private Long templateId;
    private String templateLevel;

    private Instant date;
    private MessageStatus status;
}