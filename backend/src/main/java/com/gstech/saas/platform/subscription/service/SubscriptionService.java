package com.gstech.saas.platform.subscription.service;

import com.gstech.saas.associations.unit.repository.UnitRepository;
import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.subscription.dto.PlanStatusResponse;
import com.gstech.saas.platform.subscription.dto.SubscriptionResponse;
import com.gstech.saas.platform.subscription.model.PlanLimits;
import com.gstech.saas.platform.subscription.model.Subscription;
import com.gstech.saas.platform.subscription.model.SubscriptionPlan;
import com.gstech.saas.platform.subscription.model.SubscriptionStatus;
import com.gstech.saas.platform.subscription.repository.SubscriptionRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static com.gstech.saas.platform.audit.model.AuditEvent.SUBSCRIPTION_UPDATED;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository repo;
    private final AuditService audit;
    private final UnitRepository unitRepository;

    // ── Called by TenantService during tenant creation ─────────────────────────

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
        sub.setUnitLimit(unitLimit > 0 ? unitLimit : PlanLimits.FREE_UNIT_LIMIT);
        sub.setStatus(status);
        sub.setPlanName(planName);
        sub.setNextBillingDate(nextBillingDate);
        // New tenants start on FREE, plan NOT yet selected (triggers plan selection screen)
        sub.setPlan(SubscriptionPlan.FREE);
        sub.setPlanSelected(false);

        Subscription saved = repo.save(sub);
        audit.log(SUBSCRIPTION_UPDATED.name(), "Subscription", saved.getId(), null);

        int unitsUsed = unitRepository.countByTenantId(saved.getTenantId());
        return toResponse(saved, unitsUsed);
    }

    // ── Plan selection (called from PlanController) ────────────────────────────

    @Transactional
    public SubscriptionResponse selectPlan(SubscriptionPlan plan) {
        Long tenantId = TenantContext.get();
        Subscription sub = repo.findByTenantId(tenantId);
        if (sub == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found");
        }

        sub.setPlan(plan);
        sub.setPlanSelected(true);
        sub.setPlanSelectedAt(LocalDateTime.now());

        // STANDARD plan keeps same unit limit (15 free, then pay per unit)
        // FREE plan also gets 15 units
        if (sub.getUnitLimit() < PlanLimits.FREE_UNIT_LIMIT) {
            sub.setUnitLimit(PlanLimits.FREE_UNIT_LIMIT);
        }

        Subscription saved = repo.save(sub);
        audit.log(SUBSCRIPTION_UPDATED.name(), "Subscription", saved.getId(), null);

        int unitsUsed = unitRepository.countByTenantId(tenantId);
        return toResponse(saved, unitsUsed);
    }

    // ── Unit limit check (called by UnitService.checkUnitLimit) ───────────────

    public int getUnitLimit(Long tenantId) {
        Subscription sub = repo.findByTenantId(tenantId);
        if (sub != null && sub.getUnitLimit() > 0) {
            return sub.getUnitLimit();
        }
        // Default: FREE plan = 15 units
        return PlanLimits.FREE_UNIT_LIMIT;
    }

    // ── Plan status (for frontend banner + guard) ──────────────────────────────

    public PlanStatusResponse getPlanStatus() {
        Long tenantId = TenantContext.get();
        Subscription sub = repo.findByTenantId(tenantId);
        if (sub == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found");
        }

        int unitsUsed = unitRepository.countByTenantId(tenantId);
        int freeLimit  = PlanLimits.FREE_UNIT_LIMIT;
        int remaining  = Math.max(0, freeLimit - unitsUsed);
        boolean atLimit = unitsUsed >= freeLimit;
        double charge  = PlanLimits.calculateMonthlyChargeDollars(unitsUsed);

        return new PlanStatusResponse(
                sub.isPlanSelected(),
                sub.getPlan(),
                unitsUsed,
                freeLimit,
                remaining,
                atLimit,
                charge,
                sub.getPlanName()
        );
    }

    public SubscriptionResponse getSubscription() {
        Long tenantId = TenantContext.get();
        Subscription sub = repo.findByTenantId(tenantId);
        if (sub == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found for tenant");
        }
        int unitsUsed = unitRepository.countByTenantId(tenantId);
        return toResponse(sub, unitsUsed);
    }

    // ── Mapping ────────────────────────────────────────────────────────────────

    private SubscriptionResponse toResponse(Subscription sub, int unitsUsed) {
        return new SubscriptionResponse(
                sub.getId(),
                sub.getTenantId(),
                sub.getUnitLimit(),
                sub.getStatus(),
                sub.getPlanName(),
                sub.getNextBillingDate(),
                unitsUsed,
                sub.getPlan() != null ? sub.getPlan() : SubscriptionPlan.FREE,
                sub.isPlanSelected(),
                sub.getPlanSelectedAt()
        );
    }
}