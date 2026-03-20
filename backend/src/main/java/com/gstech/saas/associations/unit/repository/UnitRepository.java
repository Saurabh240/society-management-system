package com.gstech.saas.associations.unit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.gstech.saas.associations.unit.model.Unit;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {

    // Named query replaced with derived method — simpler, same SQL
    boolean existsByAssociationIdAndUnitNumberAndIdNot(Long associationId, String unitNumber, Long id);

    boolean existsByAssociationIdAndUnitNumber(Long associationId, String unitNumber);

    int countByTenantId(Long tenantId);

    // Fetch joins kept only where owners/association are actually needed for
    // the response — avoids loading the full graph on every query path
    @Query("""
        SELECT u FROM Unit u
        LEFT JOIN FETCH u.association
        LEFT JOIN FETCH u.unitOwners uo
        LEFT JOIN FETCH uo.owner
        WHERE u.id = :id
    """)
    Optional<Unit> findUnitWithOwnersById(@Param("id") Long id);

    @Query("""
        SELECT u FROM Unit u
        LEFT JOIN FETCH u.association
        LEFT JOIN FETCH u.unitOwners uo
        LEFT JOIN FETCH uo.owner
        WHERE u.association.id = :associationId
        AND u.tenantId = :tenantId
    """)
    List<Unit> findByAssociationIdAndTenantId(
            @Param("associationId") Long associationId,
            @Param("tenantId") Long tenantId
    );

    @Query("""
        SELECT u FROM Unit u
        LEFT JOIN FETCH u.association
        LEFT JOIN FETCH u.unitOwners uo
        LEFT JOIN FETCH uo.owner
        WHERE u.tenantId = :tenantId
    """)
    List<Unit> findByTenantId(@Param("tenantId") Long tenantId);
}
