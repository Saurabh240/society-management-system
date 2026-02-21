package com.gstech.saas.communication.community.dtos;

import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for creating a new community")
public record CommunitySaveRequest(
        @Schema(
                description = "Name of the community",
                example = "Green Valley Residency",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "Community name must not be blank")
        String name

) {

    public CommunitySaveRequest {
        if (name != null) {
            name = name.trim();
        }
    }
}