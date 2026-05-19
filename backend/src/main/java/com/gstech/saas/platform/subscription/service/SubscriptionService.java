package com.gstech.saas.platform.subscription.service;

import com.gstech.saas.associations.unit.repository.UnitRepository;
import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.subscription.dto.SubscriptionResponse;
import com.gstech.saas.platform.subscription.model.Subscription;
import com.gstech.saas.platform.subscription.model.SubscriptionStatus;
import com.gstech.saas.platform.subscription.repository.SubscriptionRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static com.gstech.saas.platform.audit.model.AuditEvent.SUBSCRIPTION_UPDATED;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository repo;
    private final AuditService audit;
    private final UnitRepository unitRepository;

    public SubscriptionResponse createOrUpdate(
            Long tenantId,
            int unitLimit,
            SubscriptionStatus status,
            String planName,
            LocalDate nextBillingDate) {

        Subscription sub = repo.findByTenantId(tenantId);

        if (sub == null) {
            sub = new Subscription();
        }

        sub.setTenantId(tenantId);
        sub.setUnitLimit(unitLimit);
        sub.setStatus(status);
        sub.setPlanName(planName);
        sub.setNextBillingDate(nextBillingDate);

        Subscription saved = repo.save(sub);

        audit.log(SUBSCRIPTION_UPDATED.name(), "Subscription", saved.getId(), null);

        int unitsUsed = unitRepository.countByTenantId(saved.getTenantId());

        return new SubscriptionResponse(
                saved.getId(),
                saved.getTenantId(),
                saved.getUnitLimit(),
                saved.getStatus(),
                saved.getPlanName(),
                saved.getNextBillingDate(),
                unitsUsed
        );
    }

    public int getUnitLimit(Long tenantId) {
        Subscription sub = repo.findByTenantId(tenantId);
        if (sub != null) {
            return sub.getUnitLimit();
        }
        return 0;
    }

    public SubscriptionResponse getSubscription() {
        Long tenantId = TenantContext.get();

        Subscription sub = repo.findByTenantId(tenantId);
        if (sub == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found for tenant");
        }

        return toResponse(sub);
    }
    private SubscriptionResponse toResponse(Subscription sub) {
        int unitsUsed = unitRepository.countByTenantId(sub.getTenantId());

        return new SubscriptionResponse(
                sub.getId(),
                sub.getTenantId(),
                sub.getUnitLimit(),
                sub.getStatus(),
                sub.getPlanName(),
                sub.getNextBillingDate(),
                unitsUsed
        );
    }
}