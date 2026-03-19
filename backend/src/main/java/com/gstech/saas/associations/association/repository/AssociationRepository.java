package com.gstech.saas.associations.association.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.gstech.saas.associations.association.model.Association;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AssociationRepository extends JpaRepository<Association, Long> {

    List<Association> findByTenantId(Long tenantId);

    boolean existsByTenantIdAndName(Long tenantId, String name);

    // Used in update to check name conflict excluding self
    boolean existsByTenantIdAndNameAndIdNot(Long tenantId, String name, Long id);

    boolean existsByTenantIdAndId(Long tenantId, Long id);

    @Modifying
    @Query("UPDATE Association a SET a.totalUnits = a.totalUnits + 1 WHERE a.id = :id")
    int increaseTotalUnits(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Association a SET a.totalUnits = a.totalUnits - 1 WHERE a.id = :id AND a.totalUnits > 0")
    int decreaseTotalUnits(@Param("id") Long id);
}
