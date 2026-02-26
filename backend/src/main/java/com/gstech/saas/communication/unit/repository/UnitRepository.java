package com.gstech.saas.communication.unit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gstech.saas.communication.unit.model.Unit;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    /**
     * Find all units by property id
     * 
     * @param communityId
     * @return
     */
    List<Unit> findByCommunityId(Long communityId);

    /**
     * Find all units by community id and tenant id
     */
    List<Unit> findByCommunityIdAndTenantId(Long communityId, Long tenantId);

    /**
     * Find all units by tenant id
     */
    List<Unit> findByTenantId(Long tenantId);

    /**
     * Find all units by community id and unit number
     * 
     * @param communityId
     * @param unitNumber
     * @return
     */
    Optional<Unit> findByCommunityIdAndUnitNumber(Long communityId, String unitNumber);

    /**
     * counts total created units by tenant id
     */
    int countByTenantId(Long tenantId);
}
