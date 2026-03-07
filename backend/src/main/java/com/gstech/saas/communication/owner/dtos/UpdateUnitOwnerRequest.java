package com.gstech.saas.communication.owner.dtos;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for updating an existing unit owner link")
public record UpdateUnitOwnerRequest(
        @Schema(description = "Is owner a board member?", example = "true") Boolean isBoardMember,
        @Schema(description = "Term start date", example = "2024-01-01T00:00:00Z") Instant termStartDate,
        @Schema(description = "Term end date", example = "2024-12-31T23:59:59Z") Instant termEndDate) {
}
