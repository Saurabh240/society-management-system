package com.gstech.saas.platform.audit.service;

import com.gstech.saas.platform.audit.model.AuditEntity;
import com.gstech.saas.platform.audit.repository.AuditRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditRepository repo;

    public void log(
            String action,
            String entity,
            Long entityId,
            Long userId
    ) {
        try {
            AuditEntity audit = new AuditEntity();
            // tenant may be null for platform-level actions
            audit.setTenantId(TenantContext.get());
            audit.setUserId(userId);
            audit.setAction(action);
            audit.setEntity(entity);
            audit.setEntityId(entityId);
            // safety in case @PrePersist not triggered
            audit.setTimestamp(Instant.now());

            repo.save(audit);

        } catch (Exception ex) {
            // ⚠ Audit should NEVER break main business logic
            // You can replace with logger later
            System.err.println("Audit logging failed: " + ex.getMessage());
        }
    }

    // Optional convenience method when no userId needed
    public void log(String action, String entity, Long entityId) {
        log(action, entity, entityId, null);
    }
}
