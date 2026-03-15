package com.gstech.saas.associations.unit.dtos;

import com.gstech.saas.associations.unit.model.OccupancyStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdateOccupancyRequest(

                @Schema(description = "Occupancy status of the unit", example = "OWNER_OCCUPIED") @NotNull(message = "Occupancy status is required") OccupancyStatus occupancyStatus) {

}
