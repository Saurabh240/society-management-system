package com.gstech.saas.associations.help.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FeatureSuggestionRequest(

        @NotBlank(message = "Feature title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        /**
         * Optional pre-signed URL or file path for an attachment.
         *
         * The frontend uploads the file directly to storage (S3 or local)
         * and sends back the resulting URL/path in this field.
         * The backend stores it as-is — no binary upload through this endpoint.
         *
         * Max 500 chars to accommodate long S3 pre-signed URLs.
         */
        @Size(max = 500, message = "Attachment URL must not exceed 500 characters")
        String attachmentUrl
) {}