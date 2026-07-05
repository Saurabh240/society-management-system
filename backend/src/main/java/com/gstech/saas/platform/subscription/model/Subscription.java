package com.gstech.saas.platform.subscription.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Data
public class Subscription {

    @Id
    @GeneratedValue
    private Long id;

    private Long tenantId;
    private int unitLimit;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "status", nullable = false, length = 20)
    private SubscriptionStatus status;

    @Column
    private String planName;

    @Column
    private LocalDate nextBillingDate;

    // ── Plan selection fields ─────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false, length = 20)
    private SubscriptionPlan plan = SubscriptionPlan.FREE;

    /** True once user has actively chosen a plan (triggers redirect on first login). */
    @Column(name = "plan_selected", nullable = false)
    private boolean planSelected = false;

    @Column(name = "plan_selected_at")
    private LocalDateTime planSelectedAt;

    @Column(name = "stripe_customer_id", length = 100)
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id", length = 100)
    private String stripeSubscriptionId;
}