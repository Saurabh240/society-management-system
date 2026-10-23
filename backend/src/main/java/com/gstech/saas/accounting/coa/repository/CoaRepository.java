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

    boolean existsByTenantIdAndAccountCode(Long tenantId, String accountCode);

    boolean existsByTenantIdAndAccountCodeAndIdNot(Long tenantId, String accountCode, Long id);

    Optional<Coa> findByIdAndTenantIdAndIsDeletedFalse(Long id, Long tenantId);

    List<Coa> findByTenantIdAndIdInAndIsDeletedFalse(
            Long tenantId,
            Collection<Long> ids
    );
    Optional<Coa> findFirstByTenantIdAndAccountTypeAndIsDeletedFalse(
            Long tenantId, AccountType accountType);
    Optional<Coa> findByIdAndTenantId(Long id, Long tenantId);

    @Query(value = """
SELECT MAX(CAST(substring(c.account_code FROM '^[0-9]+') AS BIGINT))
FROM chart_of_accounts c
WHERE c.tenant_id = :tenantId
AND c.account_code ~ '^[0-9]+'
""", nativeQuery = true)
    Long findMaxNumericAccountCode(@Param("tenantId") Long tenantId);

    Optional<Coa> findByTenantIdAndAccountCodeAndIsDeletedFalse(Long tenantId, String accountCode);
}