package com.gstech.saas.associations.help.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FeatureSuggestionRequest(

        @NotBlank(message = "Feature title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description
) {}