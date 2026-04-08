package com.gstech.saas.accounting.coa.repository;

import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.model.Coa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoaRepository extends JpaRepository<Coa, Long> {

    // --- base listing ---
    Page<Coa> findByTenantIdAndIsDeletedFalse(
            Long tenantId, Pageable pageable);

    // --- filter by type only ---
    Page<Coa> findByTenantIdAndAccountTypeAndIsDeletedFalse(
            Long tenantId, AccountType accountType, Pageable pageable);

    // --- search by name only ---
    Page<Coa> findByTenantIdAndAccountNameContainingIgnoreCaseAndIsDeletedFalse(
            Long tenantId, String accountName, Pageable pageable);

    // --- search by name + type ---
    Page<Coa> findByTenantIdAndAccountNameContainingIgnoreCaseAndAccountTypeAndIsDeletedFalse(
            Long tenantId, String accountName, AccountType accountType, Pageable pageable);

    // --- duplicate-code guards ---
    boolean existsByTenantIdAndAccountCodeAndIsDeletedFalse(
            Long tenantId, String accountCode);

    boolean existsByTenantIdAndAccountCodeAndIdNotAndIsDeletedFalse(
            Long tenantId, String accountCode, Long id);
}