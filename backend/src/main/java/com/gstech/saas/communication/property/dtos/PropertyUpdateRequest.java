package com.gstech.saas.communication.property.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record PropertyUpdateRequest(
        @Schema(description = "Property name", example = "Property 1") @NotBlank(message = "Property name is required") String name) {
    public PropertyUpdateRequest {
        
    }

}
