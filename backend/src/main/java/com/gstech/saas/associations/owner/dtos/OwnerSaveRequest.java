package com.gstech.saas.associations.owner.dtos;

import java.time.Instant;
import java.time.LocalDate;

import com.gstech.saas.associations.owner.enums.BoardDesignation;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import static io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED;

@Schema(description = "Request payload for creating a new owner")
public record OwnerSaveRequest(

        @Schema(description = "Unit ID", requiredMode = REQUIRED)
        @NotNull(message = "Unit ID must not be null")
        Long unitId,

        @Schema(description = "Association ID", requiredMode = REQUIRED)
        @NotNull(message = "Association ID must not be null")
        Long associationId,

        @Schema(description = "First name", example = "John", requiredMode = REQUIRED)
        @NotBlank(message = "First name must not be blank")
        @Size(max = 60)
        String firstName,

        @Schema(description = "Last name", example = "Doe", requiredMode = REQUIRED)
        @NotBlank(message = "Last name must not be blank")
        @Size(max = 60)
        String lastName,

        @Schema(description = "Email address", example = "john.doe@example.com", requiredMode = REQUIRED)
        @NotBlank(message = "Email must not be blank")
        @Email(message = "Invalid email format")
        String email,

        @Schema(description = "Alternate email address")
        @Email(message = "Invalid alternate email format")
        String altEmail,

        @Schema(description = "Phone number", example = "+1234567890", requiredMode = REQUIRED)
        @NotBlank(message = "Phone must not be blank")
        String phone,

        @Schema(description = "Alternate phone number")
        String altPhone,

        @Schema(description = "Primary street address", requiredMode = REQUIRED)
        @NotBlank(message = "Primary street must not be blank")
        String primaryStreet,

        @Schema(description = "Primary city", requiredMode = REQUIRED)
        @NotBlank(message = "Primary city must not be blank")
        String primaryCity,

        @Schema(description = "Primary state", requiredMode = REQUIRED)
        @NotBlank(message = "Primary state must not be blank")
        String primaryState,

        @Schema(description = "Primary ZIP code", requiredMode = REQUIRED)
        @NotBlank(message = "Primary ZIP must not be blank")
        @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid ZIP code format")
        String primaryZip,

        @Schema(description = "Alternate street address")
        String altStreet,

        @Schema(description = "Alternate city")
        String altCity,

        @Schema(description = "Alternate state")
        String altState,

        @Schema(description = "Alternate ZIP code")
        @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid alternate ZIP format")
        String altZip,

        @Schema(description = "Is board member?", example = "false")
        Boolean isBoardMember,

        @Schema(description = "Board designation — required when isBoardMember is true")
        BoardDesignation designation,

        @Schema(description = "Term start date — required when isBoardMember is true")
        LocalDate termStartDate,

        @Schema(description = "Term end date — required when isBoardMember is true")
        LocalDate termEndDate
) {
    public OwnerSaveRequest {
        if (isBoardMember == null) isBoardMember = false;
        if (firstName != null) firstName = firstName.trim();
        if (lastName != null) lastName = lastName.trim();
        if (email != null) email = email.trim().toLowerCase();
        if (altEmail != null) altEmail = altEmail.trim().toLowerCase();
    }
}

