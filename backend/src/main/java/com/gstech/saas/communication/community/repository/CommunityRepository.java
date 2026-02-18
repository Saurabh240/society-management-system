package com.gstech.saas.communication.community.repository;

import com.gstech.saas.communication.community.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityRepository extends JpaRepository<Community,Long> {
    /**
     * Get all communities for a tenant
     */
    List<Community> findByTenantId(Long tenantID);

    /**
     * Check if community name already exists for tenant
     */
    boolean existsByTenantIdAndName(Long tenantId, String name);
}
