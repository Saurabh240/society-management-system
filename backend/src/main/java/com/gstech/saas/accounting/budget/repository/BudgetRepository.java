package com.gstech.saas.accounting.budget.repository;

import com.gstech.saas.accounting.budget.dto.BudgetStatus;
import com.gstech.saas.accounting.budget.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Tenant-safe single fetch
    Optional<Budget> findByIdAndTenantId(Long id, Long tenantId);

    // List all budgets for tenant, optional filters
    @Query("""
        SELECT b FROM Budget b
        WHERE b.tenantId = :tenantId
          AND (:associationId IS NULL OR b.associationId = :associationId)
          AND (:fiscalYear    IS NULL OR b.fiscalYear    = :fiscalYear)
        ORDER BY b.fiscalYear DESC, b.name ASC
    """)
    List<Budget> findAllWithFilters(
            @Param("tenantId")      Long    tenantId,
            @Param("associationId") Long    associationId,
            @Param("fiscalYear")    Integer fiscalYear
    );

    // Check for duplicate active budget per association per year
    @Query("""
    SELECT COUNT(b) FROM Budget b
    WHERE b.tenantId   = :tenantId
      AND b.fiscalYear = :fiscalYear
      AND b.status     = :status
      AND (
            (:associationId IS NULL AND b.associationId IS NULL)
            OR b.associationId = :associationId
          )
      AND (:excludeId IS NULL OR b.id <> :excludeId)
""")
    Long countActiveBudget(
            @Param("tenantId")      Long         tenantId,
            @Param("associationId") Long         associationId,
            @Param("fiscalYear")    Integer      fiscalYear,
            @Param("excludeId")     Long         excludeId,
            @Param("status") BudgetStatus status
    );
}