package com.gstech.saas.communication.dto;

import java.time.Instant;

public record TemplateCategoryResponse(
    Long id,
    Long tenantId,
    String categoryName,
    String description,
    Instant createdAt
) {}
