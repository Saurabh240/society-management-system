package com.gstech.saas.communication.community.dtos;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response payload for community details")
public record CommunityResponse(
        @Schema(description = "Unique identifier of the community") Long id,

        @Schema(description = "Name of the community") String name,

        @Schema(description = "Status of the community") String status,

        @Schema(description = "Tenant identifier") Long tenantId,

        @Schema(description = "Creation timestamp") Instant createdAt,

        @Schema(description = "Last update timestamp") Instant updatedAt) {
}
