package com.gstech.saas.associations.unit.dtos;

import com.gstech.saas.associations.unit.model.OccupancyStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

import static io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED;

public record UnitSaveRequest(

        @Schema(description = "Unit number", example = "101", requiredMode = REQUIRED)
        @NotBlank(message = "Unit number is required")
        String unitNumber,

        @Schema(description = "Association ID", example = "1", requiredMode = REQUIRED)
        @NotNull(message = "Association ID is required")
        Long associationId,

        @Schema(description = "Street address", example = "123 Main St", requiredMode = REQUIRED)
        @NotBlank(message = "Street is required")
        String street,

        @Schema(description = "City", example = "New York", requiredMode = REQUIRED)
        @NotBlank(message = "City is required")
        String city,

        @Schema(description = "State", example = "NY", requiredMode = REQUIRED)
        @NotBlank(message = "State is required")
        String state,

        @Schema(description = "ZIP code", example = "10001", requiredMode = REQUIRED)
        @NotBlank(message = "ZIP code is required")
        @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid ZIP code format")
        String zipCode,

        @Schema(description = "Occupancy status", example = "OWNER_OCCUPIED", requiredMode = REQUIRED)
        @NotNull(message = "Occupancy status is required")
        OccupancyStatus occupancyStatus,

        @Schema(description = "Opening balance", example = "0.00")
        @DecimalMin(value = "0.0", message = "Balance cannot be negative")
        @Digits(integer = 8, fraction = 2, message = "Balance format invalid")
        BigDecimal balance,

        @Schema(description = "Renter first name — required when occupancyStatus is RENTED")
        String renterFirstName,

        @Schema(description = "Renter last name — required when occupancyStatus is RENTED")
        String renterLastName,

        @Schema(description = "Renter email", example = "john.doe@example.com")
        @Email(message = "Invalid renter email format")
        String renterEmail,

        @Schema(description = "Renter phone", example = "+1234567890")
        String renterPhone
) {
    public UnitSaveRequest {
        if (unitNumber != null) unitNumber = unitNumber.trim();
        if (street != null) street = street.trim();
        if (balance == null) balance = BigDecimal.ZERO;
    }
}