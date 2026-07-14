package com.gstech.saas.accounting.budget.repository;

import com.gstech.saas.accounting.budget.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByTenantIdOrderByFiscalYearDesc(Long tenantId);

    List<Budget> findByTenantIdAndAssociationIdOrderByFiscalYearDesc(
            Long tenantId, Long associationId);

    Optional<Budget> findByIdAndTenantId(Long id, Long tenantId);

    /**
     * Fetches budget with all line items eagerly in one query.
     * Avoids N+1 when building Budget vs Actual report or loading detail view.
     */
    @Query("""
        SELECT b FROM Budget b
        LEFT JOIN FETCH b.lineItems
        WHERE b.id = :id AND b.tenantId = :tenantId
    """)
    Optional<Budget> findByIdAndTenantIdWithLineItems(
            @Param("id")       Long id,
            @Param("tenantId") Long tenantId
    );
}