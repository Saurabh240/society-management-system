package com.gstech.saas.accounting.banking.repository;

import com.gstech.saas.accounting.banking.model.Banking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankingRepository extends JpaRepository<Banking, Long> {

    List<Banking> findByTenantId(Long tenantId);


    List<Banking> findByTenantIdAndAssociationId(Long tenantId, Long associationId);

    Optional<Banking> findByIdAndTenantId(Long id, Long tenantId);
}