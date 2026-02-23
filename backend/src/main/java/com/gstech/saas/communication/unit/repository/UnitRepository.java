package com.gstech.saas.communication.unit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gstech.saas.communication.unit.model.Unit;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    /**
     * Find all units by property id
     * 
     * @param propertyId
     * @return
     */
    List<Unit> findByPropertyId(Long propertyId);

    /**
     * Find all units by property id and tenant id
     */
    List<Unit> findByPropertyIdAndTenantId(Long propertyId, Long tenantId);

    /**
     * Find all units by tenant id
     */
    List<Unit> findByTenantId(Long tenantId);

    /**
     * Find all units by property id and unit number
     * 
     * @param propertyId
     * @param unitNumber
     * @return
     */
    Optional<Unit> findByPropertyIdAndUnitNumber(Long propertyId, String unitNumber);

    /**
     * counts total created units by tenant id
     */
    int countByTenantId(Long tenantId);
}
