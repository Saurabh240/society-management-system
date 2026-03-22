package com.gstech.saas.associations.owner.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Request payload for updating an owner — all fields optional")
public record OwnerUpdateRequest(

        @Schema(description = "First name")
        @Size(max = 60)
        String firstName,

        @Schema(description = "Last name")
        @Size(max = 60)
        String lastName,

        @Schema(description = "Email address")
        @Email(message = "Invalid email format")
        String email,

        @Schema(description = "Alternate email")
        @Email(message = "Invalid alternate email format")
        String altEmail,

        @Schema(description = "Phone number")
        String phone,

        @Schema(description = "Alternate phone")
        String altPhone,

        @Schema(description = "Primary street")
        String primaryStreet,

        @Schema(description = "Primary city")
        String primaryCity,

        @Schema(description = "Primary state")
        String primaryState,

        @Schema(description = "Primary ZIP")
        @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid ZIP code format")
        String primaryZip,

        @Schema(description = "Alternate street")
        String altStreet,

        @Schema(description = "Alternate city")
        String altCity,

        @Schema(description = "Alternate state")
        String altState,

        @Schema(description = "Alternate ZIP")
        @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid alternate ZIP format")
        String altZip
) {
    public OwnerUpdateRequest {
        if (firstName != null) firstName = firstName.trim();
        if (lastName != null) lastName = lastName.trim();
        if (email != null) email = email.trim().toLowerCase();
        if (altEmail != null) altEmail = altEmail.trim().toLowerCase();
    }
}
