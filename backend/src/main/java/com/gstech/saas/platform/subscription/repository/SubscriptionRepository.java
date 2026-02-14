package com.gstech.saas.platform.subscription.repository;

import com.gstech.saas.platform.subscription.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Subscription findByTenantId(Long tenantId);
}
