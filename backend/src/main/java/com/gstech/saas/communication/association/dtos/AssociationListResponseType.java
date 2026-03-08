package com.gstech.saas.communication.association.dtos;

import java.time.Instant;

import com.gstech.saas.communication.association.model.AssociationStatus;

import io.swagger.v3.oas.annotations.media.Schema;

//for list of associations
//will reduce api response size
@Schema(description = "Response payload for association list")
public record AssociationListResponseType(
                @Schema(description = "Unique identifier of the association") Long id,

                @Schema(description = "Name of the association") String name,

                @Schema(description = "Status of the association") AssociationStatus status,

                @Schema(description = "Tenant identifier") Long tenantId,
                @Schema(description = "total units count") Integer totalUnits,

                @Schema(description = "Creation timestamp") Instant createdAt,

                @Schema(description = "Last update timestamp") Instant updatedAt) {
}
