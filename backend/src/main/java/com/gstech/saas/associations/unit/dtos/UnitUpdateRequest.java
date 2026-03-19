package com.gstech.saas.associations.unit.dtos;

import com.gstech.saas.associations.unit.model.OccupancyStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record UnitUpdateRequest(

        @Schema(description = "Unit number", example = "101")
        String unitNumber,

        @Schema(description = "Street address", example = "123 Main St")
        String street,

        @Schema(description = "City", example = "New York")
        String city,

        @Schema(description = "State", example = "NY")
        String state,

        @Schema(description = "ZIP code", example = "10001")
        @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid ZIP code format")
        String zipCode,

        @Schema(description = "Occupancy status", example = "OWNER_OCCUPIED")
        OccupancyStatus occupancyStatus,

        @Schema(description = "Balance", example = "250.00")
        @DecimalMin(value = "0.0", message = "Balance cannot be negative")
        @Digits(integer = 8, fraction = 2, message = "Balance format invalid")
        BigDecimal balance,

        @Schema(description = "Renter first name")
        String renterFirstName,

        @Schema(description = "Renter last name")
        String renterLastName,

        @Schema(description = "Renter email")
        @Email(message = "Invalid renter email format")
        String renterEmail,

        @Schema(description = "Renter phone")
        String renterPhone
) {
    public UnitUpdateRequest {
        if (unitNumber != null) unitNumber = unitNumber.trim();
        if (street != null) street = street.trim();
    }
}