package com.gstech.saas.communication.owner.dtos;

import java.time.Instant;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response payload for owner details")
public record OwnerDetailedResponse(
        @Schema(description = "Unique identifier of the owner") Long id,
        @Schema(description = "First name") String firstName,
        @Schema(description = "Last name") String lastName,
        @Schema(description = "Primary street address") String primaryStreet,
        @Schema(description = "Primary city") String primaryCity,
        @Schema(description = "Primary state") String primaryState,
        @Schema(description = "Primary zip code") String primaryZip,
        @Schema(description = "Alternate street address") String altStreet,
        @Schema(description = "Alternate city") String altCity,
        @Schema(description = "Alternate state") String altState,
        @Schema(description = "Alternate zip code") String altZip,
        @Schema(description = "Email address") String email,
        @Schema(description = "Alternate email address") String altEmail,
        @Schema(description = "Phone number") String phone,
        @Schema(description = "Alternate phone number") String altPhone,
        @Schema(description = "Tenant ID") Long tenantId,
        @Schema(description = "Creation timestamp") Instant createdAt,
        @Schema(description = "Unit number associated with the owner") String unitNumber,
        @Schema(description = "Association name") String associationName,
        @Schema(description = "Whether the owner is a board member") Boolean isBoardMember,
        @Schema(description = "Board member term start date") Instant termStartDate,
        @Schema(description = "Board member term end date") Instant termEndDate) {}
