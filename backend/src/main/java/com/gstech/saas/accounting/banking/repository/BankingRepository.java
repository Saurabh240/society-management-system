package com.gstech.saas.accounting.banking.repository;

import com.gstech.saas.accounting.banking.model.Banking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankingRepository extends JpaRepository<Banking, Long> {

    // All bank accounts for a tenant (no association filter)
    List<Banking> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    // Filter by association
    List<Banking> findByTenantIdAndAssociationIdOrderByCreatedAtDesc(
            Long tenantId, Long associationId);

    // Tenant-scoped single fetch — used for update/delete security check
    Optional<Banking> findByIdAndTenantId(Long id, Long tenantId);
}
