package com.gstech.saas.platform.subscription;

import com.gstech.saas.platform.subscription.model.Subscription;
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
    public Subscription subscribe(@RequestParam Long tenantId, @RequestParam int unitLimit) {
        return service.createOrUpdate(tenantId, unitLimit);
    }
}
