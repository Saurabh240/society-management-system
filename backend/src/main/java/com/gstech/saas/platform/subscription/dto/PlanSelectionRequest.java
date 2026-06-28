package com.gstech.saas.platform.subscription.dto;

import com.gstech.saas.platform.subscription.model.SubscriptionPlan;
import jakarta.validation.constraints.NotNull;

public record PlanSelectionRequest(
        @NotNull SubscriptionPlan plan
) {}