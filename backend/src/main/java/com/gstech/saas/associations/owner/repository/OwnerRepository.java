package com.gstech.saas.associations.owner.repository;

import java.util.List;
import java.util.Optional;

import com.gstech.saas.associations.owner.dtos.OwnerUnitRowResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gstech.saas.associations.owner.model.Owner;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {

    // Scoped to tenant — global uniqueness check was wrong for multi-tenant
    boolean existsByTenantIdAndEmail(Long tenantId, String email);

    // Exclude self during email update
    boolean existsByTenantIdAndEmailAndIdNot(Long tenantId, String email, Long id);

    @Query("""
        SELECT new com.gstech.saas.associations.owner.dtos.OwnerUnitRowResponse(
            o.id,
            o.firstName,
            o.lastName,
            a.id,
            a.name,
            u.id,
            u.unitNumber,
            o.email,
            o.phone
        )
        FROM UnitOwner uo
        JOIN uo.owner o
        JOIN uo.unit u
        JOIN u.association a
        WHERE o.tenantId = :tenantId
        AND uo.isActive = true
    """)
    List<OwnerUnitRowResponse> findOwnerUnitsByTenant(@Param("tenantId") Long tenantId);

    @Query("""
        SELECT o FROM Owner o
        JOIN o.unitOwners uo
        WHERE uo.unit.id = :unitId
        AND uo.isActive = true
    """)
    List<Owner> findAllByUnitId(@Param("unitId") Long unitId);

    @Query("""
        SELECT o FROM Owner o
        JOIN o.unitOwners uo
        JOIN uo.unit u
        WHERE uo.isBoardMember = true
        AND u.association.id = :associationId
        AND uo.isActive = true
    """)
    List<Owner> findAllBoardMembersByAssociationId(@Param("associationId") Long associationId);
}
