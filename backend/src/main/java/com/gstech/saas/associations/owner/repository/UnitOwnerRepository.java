package com.gstech.saas.associations.owner.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gstech.saas.associations.owner.model.UnitOwner;

@Repository
public interface UnitOwnerRepository extends JpaRepository<UnitOwner, Long> {

    boolean existsByUnitIdAndOwnerId(Long unitId, Long ownerId);

    Optional<UnitOwner> findByUnitIdAndOwnerId(Long unitId, Long ownerId);

    // Used when deleting an owner — fetch all links to check/clean up
    List<UnitOwner> findByOwnerId(Long ownerId);

    // Used in get() to load the link with both sides in one query
    @Query("""
        SELECT uo FROM UnitOwner uo
        JOIN FETCH uo.unit u
        JOIN FETCH u.association
        WHERE uo.unit.id = :unitId
        AND uo.owner.id = :ownerId
        AND uo.isActive = true
    """)
    Optional<UnitOwner> findActiveWithUnitAndAssociation(
            @Param("unitId") Long unitId,
            @Param("ownerId") Long ownerId
    );
}