package com.gstech.saas.communication.unit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gstech.saas.communication.unit.model.Unit;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    /**
     * Find all units by association id
     * 
     * @param associationId
     * @return
     */
    List<Unit> findByAssociationId(Long associationId);

    /**
     * Find all units by association id and tenant id
     */
    List<Unit> findByAssociationIdAndTenantId(Long associationId, Long tenantId);

    /**
     * Find all units by tenant id
     */
    List<Unit> findByTenantId(Long tenantId);

    /**
     * Find all units by community id and unit number
     * 
     * @param associationId
     * @param unitNumber
     * @return
     */
    Optional<Unit> findByAssociationIdAndUnitNumber(Long associationId, String unitNumber);

    /**
     * counts total created units by tenant id
     */
    int countByTenantId(Long tenantId);
}
