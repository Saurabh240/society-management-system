package com.gstech.saas.associations.unit.dtos;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.gstech.saas.associations.owner.model.Owner;
import com.gstech.saas.associations.unit.model.OccupancyStatus;

import lombok.Data;

public record UnitResponse(
        Long id,
        String unitNumber,
        Long tenantId,
        Long associationId,
        String street,
        String city,
        String state,
        String zipCode,
        OccupancyStatus occupancyStatus,
        String associationName,
        BigDecimal balance,      // was int — silent precision loss
        Instant createdAt,
        Instant updatedAt,
        List<String> ownerNames, // renamed from unitOwners for clarity
        String renterFirstName,
        String renterLastName,
        String renterEmail,
        String renterPhone
) {}
