package com.gstech.saas.associations.help.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SupportTicketRequest(

        @NotBlank(message = "Subject is required")
        @Size(max = 255, message = "Subject must not exceed 255 characters")
        String subject,

        @NotBlank(message = "Description is required")
        String description
) {}