package com.gstech.saas.associations.unit.dtos;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.gstech.saas.associations.owner.dtos.OwnerListResponseType;
import com.gstech.saas.associations.unit.model.OccupancyStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

public record UnitDetailedResponse(
        Long id,
        String unitNumber,
        Long tenantId,
        Long associationId,
        String street,
        String city,
        String state,
        String zipCode,
        OccupancyStatus occupancyStatus,
        BigDecimal balance,      // was int
        String associationName,
        Instant updatedAt,
        List<OwnerListResponseType> owners,
        String renterFirstName,
        String renterLastName,
        String renterEmail,
        String renterPhone
) {}