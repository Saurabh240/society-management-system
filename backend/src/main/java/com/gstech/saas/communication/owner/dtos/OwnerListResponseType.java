package com.gstech.saas.communication.owner.dtos;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response payload for owner details")
public record OwnerListResponseType(
        @Schema(description = "Unique identifier of the owner") Long id,
        @Schema(description = "First name") String firstName,
        @Schema(description = "Last name") String lastName,
        @Schema(description = "Email address") String email,
        @Schema(description = "Phone number") String phone,
        @Schema(description = "Tenant ID") Long tenantId,
        @Schema(description = "Creation timestamp") Instant createdAt) {}
