package com.gstech.saas.accounting.coa.repository;

import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.model.Coa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CoaRepository extends JpaRepository<Coa, Long> {

    // --- base listing ---
    Page<Coa> findByTenantIdAndIsDeletedFalse(
            Long tenantId, Pageable pageable);

    // --- filter by type only ---
    Page<Coa> findByTenantIdAndAccountTypeAndIsDeletedFalse(
            Long tenantId, AccountType accountType, Pageable pageable);


    @Query("""
SELECT c FROM Coa c
WHERE c.tenantId = :tenantId
AND c.isDeleted = false
AND (
    LOWER(c.accountCode) LIKE LOWER(CONCAT('%', :search, '%'))
    OR LOWER(c.accountName) LIKE LOWER(CONCAT('%', :search, '%'))
)
AND (:type IS NULL OR c.accountType = :type)
""")
    Page<Coa> searchAccounts(
            @Param("tenantId") Long tenantId,
            @Param("search") String search,
            @Param("type") AccountType type,
            Pageable pageable);

    // --- duplicate-code guards ---
    boolean existsByTenantIdAndAccountCodeAndIsDeletedFalse(
            Long tenantId, String accountCode);

    boolean existsByTenantIdAndAccountCodeAndIdNotAndIsDeletedFalse(
            Long tenantId, String accountCode, Long id);

    Optional<Coa> findByIdAndTenantIdAndIsDeletedFalse(Long id, Long tenantId);

    List<Coa> findByTenantIdAndIdInAndIsDeletedFalse(
            Long tenantId,
            Collection<Long> ids
    );

}