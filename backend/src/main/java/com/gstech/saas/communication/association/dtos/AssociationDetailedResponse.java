package com.gstech.saas.communication.association.dtos;

import com.gstech.saas.communication.association.model.AssociationStatus;
import com.gstech.saas.communication.association.model.TaxIdentityType;

import io.swagger.v3.oas.annotations.media.Schema;

//for particular association details
public record AssociationDetailedResponse(
                @Schema(description = "Unique identifier of the association") Long id,

                @Schema(description = "Name of the association") String name,

                @Schema(description = "Status of the association") AssociationStatus status,

                @Schema(description = "Street address of the association") String streetAddress,

                @Schema(description = "City of the association") String city,

                @Schema(description = "State of the association") String state,

                @Schema(description = "Zip code of the association") String zipCode,

                @Schema(description = "Tax identity type of the association") TaxIdentityType taxIdentityType,

                @Schema(description = "Tax payer ID of the association") String taxPayerID,

                @Schema(description = "Total units in the association") Integer totalUnits) {

}
