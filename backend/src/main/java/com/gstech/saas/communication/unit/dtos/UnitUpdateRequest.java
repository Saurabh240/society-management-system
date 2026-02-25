package com.gstech.saas.communication.unit.dtos;

import com.gstech.saas.communication.unit.model.OccupancyStatus;

import io.swagger.v3.oas.annotations.media.Schema;

public record UnitUpdateRequest(

        @Schema(description = "Unit number", example = "101") String unitNumber,
        @Schema(description = "Street", example = "123 Main St") String street,
        @Schema(description = "City", example = "New York") String city,
        @Schema(description = "State", example = "NY") String state,
        @Schema(description = "Zip code", example = "10001") String zipCode,
        @Schema(description = "Occupancy status", example = "OCCUPIED") OccupancyStatus occupancyStatus

) {

}
