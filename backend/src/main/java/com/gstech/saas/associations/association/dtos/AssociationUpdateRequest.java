package com.gstech.saas.associations.association.dtos;

import com.gstech.saas.associations.association.model.AssociationStatus;
import com.gstech.saas.associations.association.model.TaxIdentityType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Request payload for updating an association — all fields optional")
public record AssociationUpdateRequest(

        @Schema(description = "Updated name")
        @Size(max = 100, message = "Association name must not exceed 100 characters")
        String name,

        @Schema(description = "Updated status")
        AssociationStatus status,

        @Schema(description = "Updated street address")
        String streetAddress,

        @Schema(description = "Updated city")
        String city,

        @Schema(description = "Updated state")
        String state,

        @Schema(description = "Updated ZIP code")
        @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid ZIP code format")
        String zipCode,

        @Schema(description = "Updated tax identity type")
        TaxIdentityType taxIdentityType,

        @Schema(description = "Updated tax payer ID")
        String taxPayerId
) {
    public AssociationUpdateRequest {
        if (name != null) name = name.trim();
        if (streetAddress != null) streetAddress = streetAddress.trim();
        if (taxPayerId != null) taxPayerId = taxPayerId.trim();
    }
}