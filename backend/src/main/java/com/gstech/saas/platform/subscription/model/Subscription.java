package com.gstech.saas.platform.subscription.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

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
}