package com.gstech.saas.accounting.banking.repository;

import com.gstech.saas.accounting.banking.model.Banking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankingRepository extends JpaRepository<Banking, Long> {

    List<Banking> findByTenantId(Long tenantId);

    @Query("SELECT b FROM Banking b WHERE b.tenantId = :tenantId " +
            "AND (:associationId IS NULL OR b.associationId = :associationId)")
    List<Banking> findByTenantIdAndOptionalAssociationId(
            @Param("tenantId") Long tenantId,
            @Param("associationId") Long associationId);
}