package com.gstech.saas.platform.subscription.controller;

import com.gstech.saas.platform.subscription.dto.SubscriptionResponse;
import com.gstech.saas.platform.subscription.model.SubscriptionStatus;
import com.gstech.saas.platform.subscription.service.SubscriptionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subscription")
public class SubscriptionController {

    private final SubscriptionService service;

    public SubscriptionController(SubscriptionService service) {
        this.service = service;
    }

    @PostMapping
    public SubscriptionResponse subscribe(@RequestParam Long tenantId, @RequestParam int unitLimit, @RequestParam SubscriptionStatus status) {
        return service.createOrUpdate(tenantId, unitLimit, status);
    }

    @GetMapping
    public SubscriptionResponse getSubscription(@RequestParam Long tenantId) {
        return service.getSubscription(tenantId);
    }
}
