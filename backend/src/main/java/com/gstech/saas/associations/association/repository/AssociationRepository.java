package com.gstech.saas.associations.association.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.gstech.saas.associations.association.model.Association;

public interface AssociationRepository extends JpaRepository<Association, Long> {
    /**
     * Get all communities for a tenant
     */
    List<Association> findByTenantId(Long tenantID);

    /**
     * Check if community name already exists for tenant
     */
    boolean existsByTenantIdAndName(Long tenantId, String name);

    /**
     * Check if community exists for tenant
     */
    boolean existsByTenantIdAndId(Long tenantId, Long id);

    /**
     * Increase total units for an association
     */
    @Modifying
    @Query("UPDATE Association a SET a.totalUnits = a.totalUnits + 1 WHERE a.id = :id")
    int increaseTotalUnits(Long id);

    /**
     * Decrease total units for an association
     */
    @Modifying
    @Query("UPDATE Association a SET a.totalUnits = a.totalUnits - 1 WHERE a.id = :id")
    int decreaseTotalUnits(Long id);
}
