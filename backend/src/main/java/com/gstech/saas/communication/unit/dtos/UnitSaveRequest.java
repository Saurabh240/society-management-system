package com.gstech.saas.communication.unit.dtos;

import com.gstech.saas.communication.unit.model.OccupancyStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UnitSaveRequest(

        @Schema(description = "Unit number", example = "101") @NotBlank(message = "Unit number is required") String unitNumber,
        @Schema(description = "Association ID", example = "1") @NotNull(message = "Association ID is required") Long associationId,
        @Schema(description = "Street", example = "123 Main St") @NotNull(message = "Street is required") String street,
        @Schema(description = "City", example = "New York") @NotNull(message = "City is required") String city,
        @Schema(description = "State", example = "NY") @NotNull(message = "State is required") String state,
        @Schema(description = "Zip code", example = "10001") @NotNull(message = "Zip code is required") String zipCode,
        @NotNull(message = "Occupancy status is required") OccupancyStatus occupancyStatus,
        @NotNull(message = "Balance is required") int balance,
        @Schema(description = "Renter first name", example = "John") String renterFirstName,
        @Schema(description = "Renter last name", example = "Doe") String renterLastName,
        @Schema(description = "Renter email", example = "john.doe@example.com") String renterEmail,
        @Schema(description = "Renter phone", example = "+1234567890") String renterPhone

) {
}