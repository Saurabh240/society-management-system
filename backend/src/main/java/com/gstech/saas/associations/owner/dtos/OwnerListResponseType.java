package com.gstech.saas.associations.owner.dtos;

import java.time.Instant;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response payload for owner list")
public record OwnerListResponseType(
        @Schema(description = "Unique identifier of the owner") Long id,
        @Schema(description = "First name") String firstName,
        @Schema(description = "Last name") String lastName,
        @Schema(description = "Email address") String email,
        @Schema(description = "Phone number") String phone,
        @Schema(description = "Tenant ID") Long tenantId,
        @Schema(description = "Creation timestamp") Instant createdAt,
        @Schema(description = "Owner's units with association and board member info") List<UnitAssociationInfo> unitAssociations) {

       @Schema(description = "Unit information with association and board member details")
       public record UnitAssociationInfo(
               @Schema(description = "Unit number") String unitNumber,
               @Schema(description = "Association name") String associationName,
               @Schema(description = "Is board member") Boolean isBoardMember,
               @Schema(description = "Board term start date") Instant termStartDate,
               @Schema(description = "Board term end date") Instant termEndDate) {}
}
