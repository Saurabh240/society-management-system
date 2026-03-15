package com.gstech.saas.associations.association.dtos;

import com.gstech.saas.associations.association.model.AssociationStatus;
import com.gstech.saas.associations.association.model.TaxIdentityType;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for updating a community")
public record AssociationUpdateRequest(
        @Schema(description = "Name of the community", example = "Green Valley Residency") String name,
        @Schema(description = "Status of the community", example = "ACTIVE") AssociationStatus status,
        @Schema(description = "Street address of the community", example = "123 Main St") String streetAddress,
        @Schema(description = "City of the community", example = "New York") String city,
        @Schema(description = "State of the community", example = "NY") String state,
        @Schema(description = "Zip code of the community", example = "10001") String zipCode,
        @Schema(description = "Tax identity type of the community", example = "TAX_ID") TaxIdentityType taxIdentityType,
        @Schema(description = "Tax payer id of the community", example = "123456789") String taxPayerId) {
    public AssociationUpdateRequest {
        if (name != null) {
            name = name.trim();
        }
    }
}
