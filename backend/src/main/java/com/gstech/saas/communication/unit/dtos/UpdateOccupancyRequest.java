package com.gstech.saas.communication.unit.dtos;

import com.gstech.saas.communication.unit.model.OccupancyStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdateOccupancyRequest(

                @Schema(description = "Occupancy status of the unit", example = "OCCUPIED") @NotNull(message = "Occupancy status is required") OccupancyStatus occupancyStatus) {

}
