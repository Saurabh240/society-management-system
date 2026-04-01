package com.gstech.saas.communication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateMailingRequest {

    @NotNull(message = "Association is required")
    private Long associationId;

    private String recipientType;

    /**
     * Specific owner IDs selected via the checkbox list on the form.
     * If null or empty, all owners in the association are targeted.
     */
    private List<Long> ownerIds;

    /** Optional — pre-fills title/content from a saved template */
    private Long templateId;

    @NotBlank(message = "Mailing title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;
}