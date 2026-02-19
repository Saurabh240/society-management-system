package com.gstech.saas.communication.property.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PropertySaveRequest(
        @Schema(description = "Property name", example = "Property 1") @NotBlank(message = "Property name is required") String name,
        @Schema(description = "Community id", example = "1") @NotNull(message = "Community id is required") Long communityId) {
    public PropertySaveRequest {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Property name is required");
        }
        if (communityId == null) {
            throw new IllegalArgumentException("Community id is required");
        }
    }

}
