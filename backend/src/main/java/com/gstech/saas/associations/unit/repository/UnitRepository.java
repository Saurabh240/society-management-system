package com.gstech.saas.associations.unit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.gstech.saas.associations.unit.model.Unit;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    /**
     * Find all units by association id
     * 
     * @param associationId
     * @return
     */
    @Query("SELECT u FROM Unit u  LEFT JOIN fetch u.association a LEFT JOIN fetch u.unitOwners uo LEFT JOIN fetch uo.owner where u.association.id = :associationId")
    List<Unit> findByAssociationId(Long associationId);

    /**
     * Find all units by association id and tenant id
     */
    @Query("SELECT u FROM Unit u  LEFT JOIN fetch u.association a LEFT JOIN fetch u.unitOwners uo LEFT JOIN fetch uo.owner where u.association.id = :associationId AND u.tenantId = :tenantId")
    List<Unit> findByAssociationIdAndTenantId(Long associationId, Long tenantId);

    /**
     * Find all units by tenant id
     */
    @Query("SELECT u FROM Unit u LEFT JOIN fetch u.association a LEFT JOIN fetch u.unitOwners uo LEFT JOIN fetch uo.owner where u.tenantId = :tenantId")
    List<Unit> findByTenantId(Long tenantId);

    /**
     * Find unit by id
     */
    @Query("SELECT u FROM Unit u  LEFT JOIN fetch u.association a LEFT JOIN fetch u.unitOwners uo LEFT JOIN fetch uo.owner where u.id = :id")
    Optional<Unit> findUnitById(Long id);

    /**
     * Find all units by community id and unit number
     * 
     * @param associationId
     * @param unitNumber
     * @return
     */

    @Query("SELECT u FROM Unit u LEFT JOIN fetch u.association a LEFT JOIN  fetch u.unitOwners uo LEFT JOIN fetch uo.owner where a.id = :associationId AND u.unitNumber = :unitNumber")
    Optional<Unit> findByAssociationIdAndUnitNumber(Long associationId, String unitNumber);

    /**
     * counts total created units by tenant id
     */
    int countByTenantId(Long tenantId);
}
