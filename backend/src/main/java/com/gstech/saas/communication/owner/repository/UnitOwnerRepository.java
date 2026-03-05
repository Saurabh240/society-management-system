package com.gstech.saas.communication.owner.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gstech.saas.communication.owner.model.UnitOwner;

@Repository
public interface UnitOwnerRepository extends JpaRepository<UnitOwner, Long> {

    boolean existsByUnitIdAndOwnerId(Long unitId, Long ownerId);
}
