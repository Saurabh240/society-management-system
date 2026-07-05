package com.gstech.saas.platform.subscription.dto;

import com.gstech.saas.platform.subscription.model.SubscriptionPlan;

public record PlanStatusResponse(
        boolean planSelected,
        SubscriptionPlan plan,
        int unitsUsed,
        int freeUnitLimit,
        int unitsRemaining,
        boolean isAtLimit,
        double monthlyChargeDollars,
        String planName
) {}