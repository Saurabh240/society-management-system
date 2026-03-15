package com.gstech.saas.associations.unit.dtos;

import com.gstech.saas.associations.unit.model.OccupancyStatus;

import io.swagger.v3.oas.annotations.media.Schema;

public record UnitUpdateRequest(

                @Schema(description = "Unit number", example = "101") String unitNumber,
                @Schema(description = "Street", example = "123 Main St") String street,
                @Schema(description = "City", example = "New York") String city,
                @Schema(description = "State", example = "NY") String state,
                @Schema(description = "Zip code", example = "10001") String zipCode,
                @Schema(description = "Occupancy status", example = "OWNER_OCCUPIED") OccupancyStatus occupancyStatus,
                @Schema(description = "Balance", example = "1000") int balance,
                @Schema(description = "Renter first name", example = "John") String renterFirstName,
                @Schema(description = "Renter last name", example = "Doe") String renterLastName,
                @Schema(description = "Renter email", example = "john.doe@example.com") String renterEmail,
                @Schema(description = "Renter phone", example = "+1234567890") String renterPhone


) {

}
