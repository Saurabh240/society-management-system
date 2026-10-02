package com.gstech.saas.communication.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTemplateCategoryRequest(
    @NotBlank(message = "Category name is required")
    String categoryName,
    
    String description
) {}
