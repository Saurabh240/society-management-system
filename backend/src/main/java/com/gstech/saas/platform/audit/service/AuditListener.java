package com.gstech.saas.platform.audit.service;

import com.gstech.saas.platform.common.ApplicationContextProvider;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;

public class AuditListener {

    @PostPersist
    public void afterCreate(Object entity) {
        writeAudit("CREATE", entity);
    }

    @PostUpdate
    public void afterUpdate(Object entity) {
        writeAudit("UPDATE", entity);
    }

    private void writeAudit(String action, Object entity) {

        if (!hasId(entity)) return;

        AuditService auditService =
                ApplicationContextProvider.getBean(AuditService.class);

        auditService.log(
                action,
                entity.getClass().getSimpleName(),
                extractId(entity),
                null
        );
    }

    private boolean hasId(Object entity) {
        try {
            entity.getClass().getMethod("getId");
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Long extractId(Object entity) {
        try {
            return (Long) entity.getClass()
                    .getMethod("getId")
                    .invoke(entity);
        } catch (Exception e) {
            return null;
        }
    }
}

