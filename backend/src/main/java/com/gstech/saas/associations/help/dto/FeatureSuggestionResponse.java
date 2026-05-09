package com.gstech.saas.associations.help.dto;

import java.time.Instant;

public record FeatureSuggestionResponse(
        Long id,
        Long userId,
        String title,
        String description,
        Instant createdAt
) {}