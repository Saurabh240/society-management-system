package com.gstech.saas.platform.subscription.controller;

import com.gstech.saas.platform.subscription.dto.SubscriptionResponse;
import com.gstech.saas.platform.subscription.model.SubscriptionStatus;
import com.gstech.saas.platform.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/subscription")
public class SubscriptionController {

    private final SubscriptionService service;

    public SubscriptionController(SubscriptionService service) {
        this.service = service;
    }

    @Operation(
            summary = "Create or update a subscription",
            description = "Creates a new subscription or updates an existing one for the given tenant."
    )
    @PostMapping
    public SubscriptionResponse subscribe( @RequestParam Long tenantId,
    @RequestParam int unitLimit,
    @RequestParam SubscriptionStatus status,
    @RequestParam(required = false) String planName,
    @RequestParam(required = false) LocalDate nextBillingDate) {
        return service.createOrUpdate(tenantId, unitLimit, status, planName, nextBillingDate);
    }

    @Operation(
            summary = "Get current tenant subscription",
            description = "Returns subscription details including plan name, unit limit, units used, and next billing date. Tenant is resolved from context."
    )
    @GetMapping
    public SubscriptionResponse getSubscription() {
        return service.getSubscription();
    }
}
