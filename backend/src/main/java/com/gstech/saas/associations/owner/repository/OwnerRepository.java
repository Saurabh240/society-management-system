package com.gstech.saas.associations.owner.repository;

import java.util.List;
import java.util.Optional;

import com.gstech.saas.associations.owner.dtos.OwnerUnitRowResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.gstech.saas.associations.owner.model.Owner;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByEmail(String email);

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
""")
    List<OwnerUnitRowResponse> findOwnerUnitsByTenant(Long tenantId);

    @Query("SELECT o FROM Owner o left JOIN o.unitOwners u WHERE u.unit.id = :unitId")
    List<Owner> findAllByUnitId(Long unitId);

    @Query("SELECT o FROM Owner o left JOIN o.unitOwners u left JOIN u.unit un WHERE u.isBoardMember = true AND un.association.id = :associationId")
    List<Owner> findAllBoardMembersByAssociationId(Long associationId);
}
