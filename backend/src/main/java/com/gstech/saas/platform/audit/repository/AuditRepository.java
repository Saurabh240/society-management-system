package com.gstech.saas.platform.audit.repository;

import com.gstech.saas.platform.audit.model.AuditEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditRepository
        extends JpaRepository<AuditEntity, Long> {
}
