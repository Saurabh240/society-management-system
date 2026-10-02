package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateTemplateCategoryRequest;
import com.gstech.saas.communication.dto.TemplateCategoryResponse;
import com.gstech.saas.communication.model.TemplateCategory;
import com.gstech.saas.communication.repository.TemplateCategoryRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TemplateCategoryServiceImpl implements TemplateCategoryService {

    private final TemplateCategoryRepository templateCategoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TemplateCategoryResponse> getAllCategories() {
        Long tenantId = TenantContext.get();
        List<TemplateCategory> categories = templateCategoryRepository.findByTenantId(tenantId);
        return categories.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TemplateCategoryResponse createCategory(CreateTemplateCategoryRequest request) {
        Long tenantId = TenantContext.get();

        // Check if category already exists to prevent duplicates
        if (templateCategoryRepository.existsByTenantIdAndCategoryName(tenantId, request.categoryName())) {
            return templateCategoryRepository
                    .findByTenantIdAndCategoryName(tenantId, request.categoryName())
                    .map(this::mapToResponse)
                    .orElseThrow();
        }

        TemplateCategory category = TemplateCategory.builder()
                .tenantId(tenantId)
                .categoryName(request.categoryName())
                .description(request.description())
                .createdAt(Instant.now())
                .build();

        return mapToResponse(templateCategoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public TemplateCategoryResponse getCategoryById(Long id) {
        Long tenantId = TenantContext.get();
        TemplateCategory category = templateCategoryRepository.findById(id)
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
        return mapToResponse(category);
    }

    @Override
    public void deleteCategory(Long id) {
        Long tenantId = TenantContext.get();
        templateCategoryRepository.deleteByIdAndTenantId(id, tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean categoryExists(String categoryName) {
        Long tenantId = TenantContext.get();
        return templateCategoryRepository.existsByTenantIdAndCategoryName(tenantId, categoryName);
    }

    @Override
    public TemplateCategoryResponse getOrCreateCategory(String categoryName) {
        Long tenantId = TenantContext.get();

        // Return existing category if it exists
        return templateCategoryRepository
                .findByTenantIdAndCategoryName(tenantId, categoryName)
                .map(this::mapToResponse)
                .orElseGet(() -> {
                    // Auto-create the category if it doesn't exist
                    TemplateCategory category = TemplateCategory.builder()
                            .tenantId(tenantId)
                            .categoryName(categoryName)
                            .createdAt(Instant.now())
                            .build();
                    return mapToResponse(templateCategoryRepository.save(category));
                });
    }

    // Helper
    private TemplateCategoryResponse mapToResponse(TemplateCategory category) {
        return new TemplateCategoryResponse(
                category.getId(),
                category.getTenantId(),
                category.getCategoryName(),
                category.getDescription(),
                category.getCreatedAt()
        );
    }
}
