package com.gstech.saas.communication.property.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gstech.saas.communication.property.model.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByTenantIdAndCommunityId(Long tenantId, Long communityId);

    List<Property> findByTenantId(Long tenantId);

    List<Property> findByCommunityId(Long communityId);

    boolean existsByTenantIdAndCommunityIdAndName(Long tenantId, Long communityId, String name);
}
