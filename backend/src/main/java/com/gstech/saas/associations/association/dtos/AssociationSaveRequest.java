package com.gstech.saas.associations.association.dtos;

import com.gstech.saas.associations.association.model.AssociationStatus;
import com.gstech.saas.associations.association.model.TaxIdentityType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for creating a new Association")
public record AssociationSaveRequest(
        @Schema(description = "Name of the Association", example = "Green Valley Residency", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Association name must not be blank") String name,
        @Schema(description = "Status of the Association", example = "ACTIVE") AssociationStatus status,
        @Schema(description = "Street address of the Association", example = "123 Main St") @NotBlank(message = "Street address must not be blank") String streetAddress,
        @Schema(description = "City of the Association", example = "New York") @NotBlank(message = "City must not be blank") String city,
        @Schema(description = "State of the Association", example = "NY") @NotBlank(message = "State must not be blank") String state,
        @Schema(description = "Zip code of the Association", example = "10001") @NotBlank(message = "Zip code must not be blank") String zipCode,
        @Schema(description = "Tax identity type of the Association", example = "TAX_ID") @NotNull(message = "Tax identity type must not be blank") TaxIdentityType taxIdentityType,
        @Schema(description = "Tax payer id of the Association", example = "123456789") @NotBlank(message = "Tax payer id must not be blank") String taxPayerId) {

    public AssociationSaveRequest {

    }
}