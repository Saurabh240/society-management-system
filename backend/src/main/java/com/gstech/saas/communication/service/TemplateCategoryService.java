package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateTemplateCategoryRequest;
import com.gstech.saas.communication.dto.TemplateCategoryResponse;

import java.util.List;

public interface TemplateCategoryService {

    /**
     * Get all categories for the current tenant
     */
    List<TemplateCategoryResponse> getAllCategories();

    /**
     * Create a new category for the current tenant.
     * If the category already exists, returns the existing one without creating a duplicate.
     */
    TemplateCategoryResponse createCategory(CreateTemplateCategoryRequest request);

    /**
     * Get a category by ID (scoped to current tenant)
     */
    TemplateCategoryResponse getCategoryById(Long id);

    /**
     * Delete a category by ID (scoped to current tenant)
     */
    void deleteCategory(Long id);

    /**
     * Auto-create a category if it doesn't exist.
     * Used when a template is created with a new category.
     */
    TemplateCategoryResponse getOrCreateCategory(String categoryName);
}
