package com.gstech.saas.communication.community.dtos;

import com.gstech.saas.communication.community.model.CommunityStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for creating a new community")
public record CommunitySaveRequest(
        @Schema(description = "Name of the community", example = "Green Valley Residency", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Community name must not be blank") String name,
        @Schema(description = "Status of the community", example = "ACTIVE") CommunityStatus status

) {

    public CommunitySaveRequest {
        if (name != null) {
            name = name.trim();
        }
    }
}