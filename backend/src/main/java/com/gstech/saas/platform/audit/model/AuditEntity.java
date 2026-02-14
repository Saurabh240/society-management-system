package com.gstech.saas.platform.audit.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long tenantId;
    private Long userId;
    private String action;     // LOGIN, TENANT_RESOLVED, CREATE, UPDATE
    private String entity;     // User, Tenant, etc.
    private Long entityId;
    private Instant timestamp;
    @PrePersist
    public void onCreate() {
        this.timestamp = Instant.now();
    }
}

