package com.gstech.saas.communication.property.dtos;

import java.time.Instant;

public record PropertyResponse(
        Long id,
        String name,
        Long tenantId,
        Long communityId,
        Instant createdAt,
        Instant updatedAt) {

}
