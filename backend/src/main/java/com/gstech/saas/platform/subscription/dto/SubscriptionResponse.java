package com.gstech.saas.platform.subscription.dto;

import com.gstech.saas.platform.subscription.model.SubscriptionStatus;

import java.time.LocalDate;

public record SubscriptionResponse(
        Long id,
        Long tenantId,
        int unitLimit,
        SubscriptionStatus status,

        String planName,
        LocalDate nextBillingDate,
        int unitsUsed )
{}