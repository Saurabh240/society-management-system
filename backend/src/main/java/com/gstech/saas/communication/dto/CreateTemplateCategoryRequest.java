package com.gstech.saas.communication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTemplateCategoryRequest(
        @NotBlank(message = "Category name must not be blank")
        @Size(max = 100, message = "Category name must not exceed 100 characters")
        String name
) {
    public CreateTemplateCategoryRequest {
        if (name != null) name = name.trim();
    }
}