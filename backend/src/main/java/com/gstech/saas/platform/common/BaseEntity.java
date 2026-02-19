package com.gstech.saas.platform.common;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.gstech.saas.platform.tenant.multitenancy.TenantContext;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Column(nullable = false, updatable = false)
    private Long tenantId;

    @CreatedDate
    @Column(updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onPrePersist() {

        // Set tenant automatically
        if (tenantId == null) {
            tenantId = TenantContext.get();
        }

        // Set createdAt if not set by auditing
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

}
