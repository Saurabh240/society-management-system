package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.model.TemplateCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateCategoryRepository extends JpaRepository<TemplateCategory, Long> {

    /**
     * Find all categories for a tenant
     */
    List<TemplateCategory> findByTenantId(Long tenantId);

    /**
     * Find a category by tenant ID and category name
     */
    Optional<TemplateCategory> findByTenantIdAndCategoryName(Long tenantId, String categoryName);

    /**
     * Check if a category exists for a tenant
     */
    boolean existsByTenantIdAndCategoryName(Long tenantId, String categoryName);

    /**
     * Delete a category by ID and tenant ID (prevents cross-tenant access)
     */
    void deleteByIdAndTenantId(Long id, Long tenantId);
}
