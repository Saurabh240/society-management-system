package com.gstech.saas.platform.subscription.service;

import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.subscription.dto.SubscriptionResponse;
import com.gstech.saas.platform.subscription.model.Subscription;
import com.gstech.saas.platform.subscription.model.SubscriptionStatus;
import com.gstech.saas.platform.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static com.gstech.saas.platform.audit.model.AuditEvent.SUBSCRIPTION_UPDATED;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository repo;
    private final AuditService audit;

    public SubscriptionResponse createOrUpdate(Long tenantId, int unitLimit, SubscriptionStatus status) {

        Subscription sub = repo.findByTenantId(tenantId);

        if (sub == null) {
            sub = new Subscription();
        }

        sub.setTenantId(tenantId);
        sub.setUnitLimit(unitLimit);
        sub.setStatus(status);

        Subscription saved = repo.save(sub);

        audit.log(
                SUBSCRIPTION_UPDATED.name(),
                "Subscription",
                saved.getId(),
                null
        );

        return new SubscriptionResponse(saved.getId(), saved.getTenantId(), saved.getUnitLimit(), saved.getStatus());
    }

    public int getUnitLimit(Long tenantId) {
        Subscription sub = repo.findByTenantId(tenantId);
        if (sub != null) {
            return sub.getUnitLimit();
        }
        return 0;
    }
}