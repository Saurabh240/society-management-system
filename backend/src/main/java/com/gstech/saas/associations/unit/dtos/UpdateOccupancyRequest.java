package com.gstech.saas.associations.unit.dtos;

import com.gstech.saas.associations.unit.model.OccupancyStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import static io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED;

public record UpdateOccupancyRequest(
        @Schema(description = "New occupancy status", example = "RENTED", requiredMode = REQUIRED)
        @NotNull(message = "Occupancy status is required")
        OccupancyStatus occupancyStatus
) {}