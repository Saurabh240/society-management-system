package com.gstech.saas.communication.unit.dtos;

import com.gstech.saas.communication.unit.model.OccupancyStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UnitSaveRequest(

        @NotBlank(message = "Unit number is required") String unitNumber,

        @NotNull(message = "Property ID is required") Long propertyId,

        @NotNull(message = "Occupancy status is required") OccupancyStatus occupancyStatus

) {
}