package com.gstech.saas.associations.owner.dtos;

import java.time.Instant;

import com.gstech.saas.associations.owner.enums.BoardDesignation;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for creating a new owner")
public record OwnerSaveRequest(
        @Schema(description = "ID of the unit", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull(message = "Unit ID must not be null") Long unitId,
        @Schema(description = "ID of the association", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull(message = "Association ID must not be null") Long associationId,
        @Schema(description = "First name of the owner", example = "John", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "First name must not be blank") String firstName,
        @Schema(description = "Last name of the owner", example = "Doe", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Last name must not be blank") String lastName,
        @Schema(description = "Primary street address", example = "123 Main St", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Primary street address must not be blank") String primaryStreet,
        @Schema(description = "Primary city", example = "New York", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Primary city must not be blank") String primaryCity,
        @Schema(description = "Primary state", example = "NY", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Primary state must not be blank") String primaryState,
        @Schema(description = "Primary zip code", example = "10001", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Primary zip code must not be blank") String primaryZip,
        @Schema(description = "Alternate street address", example = "456 Side St") String altStreet,
        @Schema(description = "Alternate city", example = "New York") String altCity,
        @Schema(description = "Alternate state", example = "NY") String altState,
        @Schema(description = "Alternate zip code", example = "10002") String altZip,
        @Schema(description = "Email address", example = "john.doe@example.com", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Email must not be blank") String email,
        @Schema(description = "Alternate email address", example = "john.alternate@example.com") String altEmail,
        @Schema(description = "Phone number", example = "+1234567890", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Phone must not be blank") String phone,
        @Schema(description = "Alternate phone number", example = "+0987654321") String altPhone,
        @Schema(description = "Is owner a board member?", example = "false") Boolean isBoardMember,
        @Schema(description = "Board designation", example = "CHAIRMAN") BoardDesignation designation,
        @Schema(description = "Term start date", example = "2024-01-01T00:00:00Z") Instant termStartDate,
        @Schema(description = "Term end date", example = "2024-12-31T23:59:59Z") Instant termEndDate) {

    public OwnerSaveRequest {
        if (isBoardMember == null) {
            isBoardMember = false;
        }
    }
}
