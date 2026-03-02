package com.gstech.saas.communication.association.dtos;

import com.gstech.saas.communication.association.model.AssociationStatus;
import com.gstech.saas.communication.association.model.TaxIdentityType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for creating a new community")
public record AssociationSaveRequest(
        @Schema(description = "Name of the community", example = "Green Valley Residency", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Community name must not be blank") String name,
        @Schema(description = "Status of the community", example = "ACTIVE") AssociationStatus status,
        @Schema(description = "Street address of the community", example = "123 Main St") @NotBlank(message = "Street address must not be blank") String streetAddress,
        @Schema(description = "City of the community", example = "New York") @NotBlank(message = "City must not be blank") String city,
        @Schema(description = "State of the community", example = "NY") @NotBlank(message = "State must not be blank") String state,
        @Schema(description = "Zip code of the community", example = "10001") @NotBlank(message = "Zip code must not be blank") String zipCode,
        @Schema(description = "Tax identity type of the community", example = "TAX_ID") @NotBlank(message = "Tax identity type must not be blank") TaxIdentityType taxIdentityType,
        @Schema(description = "Tax payer id of the community", example = "123456789") @NotBlank(message = "Tax payer id must not be blank") String taxPayerId) {

    public AssociationSaveRequest {

    }
}