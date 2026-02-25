package com.gstech.saas.communication.unit.dtos;

import java.time.Instant;

import com.gstech.saas.communication.unit.model.OccupancyStatus;

public record UnitResponse(
                Long id,
                String unitNumber,
                Long communityId,
                String street,
                String city,
                String state,
                String zipCode,
                OccupancyStatus occupancyStatus,
                Instant createdAt,
                Instant updatedAt) {
}
