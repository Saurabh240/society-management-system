package com.gstech.saas.communication.owner.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.gstech.saas.communication.owner.model.Owner;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByEmail(String email);

    @Query("SELECT o FROM Owner o left JOIN o.unitOwners u WHERE u.unit.tenantId = :tenantId")
    List<Owner> findAllByTenantId(Long tenantId);

    @Query("SELECT o FROM Owner o left JOIN o.unitOwners u WHERE u.unit.id = :unitId")
    List<Owner> findAllByUnitId(Long unitId);

    @Query("SELECT o FROM Owner o left JOIN o.unitOwners u left JOIN u.unit un WHERE u.isBoardMember = true AND un.association.id = :associationId")
    List<Owner> findAllBoardMembersByAssociationId(Long associationId);
}
