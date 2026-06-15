package com.gstech.saas.associations.association.dtos;

import com.gstech.saas.associations.association.model.AssociationStatus;
import com.gstech.saas.associations.association.model.TaxIdentityType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import static io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED;

@Schema(description = "Request payload for creating an association")
public record AssociationSaveRequest(

        @Schema(description = "Name of the association", example = "Green Valley Residency", requiredMode = REQUIRED)
        @NotBlank(message = "Association name must not be blank")
        @Size(max = 100, message = "Association name must not exceed 100 characters")
        String name,

        @Schema(description = "Initial status — defaults to ACTIVE if omitted")
        AssociationStatus status,

        @Schema(description = "Street address", example = "123 Main St", requiredMode = REQUIRED)
        @NotBlank(message = "Street address must not be blank")
        String streetAddress,

        @Schema(description = "City", example = "New York", requiredMode = REQUIRED)
        @NotBlank(message = "City must not be blank")
        String city,

        @Schema(description = "State", example = "NY", requiredMode = REQUIRED)
        @NotBlank(message = "State must not be blank")
        String state,

        @Schema(description = "ZIP code", example = "10001", requiredMode = REQUIRED)
        @NotBlank(message = "ZIP code must not be blank")
        @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid ZIP code format")
        String zipCode,

        @Schema(description = "Tax identity type — always EIN for associations")
        TaxIdentityType taxIdentityType,

        @Schema(description = "EIN in format XX-XXXXXXX", example = "98-7654321")
        @Pattern(
                regexp = "^\\d{2}-\\d{7}$",
                message = "EIN must be in the format XX-XXXXXXX"
        )
        String taxPayerId,

        @Schema(description = "Set to true if user wants to fill tax info later")
        Boolean taxPending
) {
    // Normalize on construction
    public AssociationSaveRequest {
        if (name != null) name = name.trim();
        if (streetAddress != null) streetAddress = streetAddress.trim();
        if (taxPayerId != null) taxPayerId = taxPayerId.trim();

        // ✅ cross-field guard
        boolean fillingLater = Boolean.TRUE.equals(taxPending);
        if (!fillingLater && (taxIdentityType == null || taxPayerId == null || taxPayerId.isBlank())) {
            throw new IllegalArgumentException(
                    "EIN (taxIdentityType + taxPayerId) is required unless 'Fill later' is checked");
        }
    }
}