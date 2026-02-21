package com.gstech.saas.communication.unit.dtos;

import java.time.Instant;

import com.gstech.saas.communication.unit.model.OccupancyStatus;

public record UnitResponse(
        Long id,
        String unitNumber,
        Long propertyId,
        Long tenantId,
        OccupancyStatus occupancyStatus,
        Instant createdAt,
        Instant updatedAt) {
}
