package com.gstech.saas.platform.subscription.dto;

import com.gstech.saas.platform.subscription.model.SubscriptionStatus;

public record SubscriptionResponse(
        Long id,
        Long tenantId,
        int unitLimit,
        SubscriptionStatus status) {
}