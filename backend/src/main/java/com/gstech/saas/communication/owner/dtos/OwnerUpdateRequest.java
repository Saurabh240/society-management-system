package com.gstech.saas.communication.owner.dtos;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for updating an owner")
public record OwnerUpdateRequest(
                @Schema(description = "ID of the association") Long associationId,
                @Schema(description = "ID of the unit") Long unitId,
                @Schema(description = "First name of the owner", example = "John") String firstName,
                @Schema(description = "Last name of the owner", example = "Doe") String lastName,
                @Schema(description = "Primary street address", example = "123 Main St") String primaryStreet,
                @Schema(description = "Primary city", example = "New York") String primaryCity,
                @Schema(description = "Primary state", example = "NY") String primaryState,
                @Schema(description = "Primary zip code", example = "10001") String primaryZip,
                @Schema(description = "Alternate street address", example = "456 Side St") String altStreet,
                @Schema(description = "Alternate city", example = "New York") String altCity,
                @Schema(description = "Alternate state", example = "NY") String altState,
                @Schema(description = "Alternate zip code", example = "10002") String altZip,
                @Schema(description = "Email address", example = "john.doe@example.com") String email,
                @Schema(description = "Alternate email address", example = "john.alternate@example.com") String altEmail,
                @Schema(description = "Phone number", example = "+1234567890") String phone,
                @Schema(description = "Alternate phone number", example = "+0987654321") String altPhone,
                @Schema(description = "Is owner a board member?", example = "true") Boolean isBoardMember,
                @Schema(description = "Term start date", example = "2024-01-01T00:00:00Z") Instant termStartDate,
                @Schema(description = "Term end date", example = "2024-12-31T23:59:59Z") Instant termEndDate) {
}
