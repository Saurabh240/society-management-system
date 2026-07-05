package com.gstech.saas.platform.subscription.dto;

import com.gstech.saas.platform.subscription.model.SubscriptionPlan;
import com.gstech.saas.platform.subscription.model.SubscriptionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SubscriptionResponse(
        Long id,
        Long tenantId,
        int unitLimit,
        SubscriptionStatus status,
        String planName,
        LocalDate nextBillingDate,
        int unitsUsed,
        SubscriptionPlan plan,
        boolean planSelected,
        LocalDateTime planSelectedAt
) {}