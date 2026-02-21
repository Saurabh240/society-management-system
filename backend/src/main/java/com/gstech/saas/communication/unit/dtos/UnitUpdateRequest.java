package com.gstech.saas.communication.unit.dtos;

import com.gstech.saas.communication.unit.model.OccupancyStatus;

import io.swagger.v3.oas.annotations.media.Schema;

public record UnitUpdateRequest(

        @Schema(description = "Unit number", example = "101") String unitNumber,

        @Schema(description = "Occupancy status of the unit", example = "OCCUPIED") OccupancyStatus occupancyStatus

) {

}
