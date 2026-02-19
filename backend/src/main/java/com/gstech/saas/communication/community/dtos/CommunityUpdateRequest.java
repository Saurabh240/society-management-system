package com.gstech.saas.communication.community.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for updating a community")
public record CommunityUpdateRequest(
        @Schema(description = "Name of the community", example = "Green Valley Residency") String name,

        @Schema(description = "Status of the community", example = "ACTIVE") String status) {
    public CommunityUpdateRequest {
        if (name != null) {
            name = name.trim();
        }
        if (status != null) {
            status = status.trim();
        }
    }
}
