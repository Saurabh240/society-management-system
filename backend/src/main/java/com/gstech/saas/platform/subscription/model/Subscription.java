package com.gstech.saas.platform.subscription.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    private String status;
}