package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateTemplateCategoryRequest;
import com.gstech.saas.communication.dto.TemplateCategoryResponse;
import com.gstech.saas.communication.model.TemplateCategory;
import com.gstech.saas.communication.repository.TemplateCategoryRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateCategoryServiceImpl implements TemplateCategoryService {

    private final TemplateCategoryRepository repo;


    @Override
    public List<TemplateCategoryResponse> getCategories() {
        Long tenantId = TenantContext.get();
        return repo.findByTenantIdOrderByNameAsc(tenantId).stream()
                .map(c -> new TemplateCategoryResponse(c.getId(), c.getName()))
                .toList();
    }

    @Override
    public TemplateCategoryResponse createCategory(CreateTemplateCategoryRequest request) {
        Long tenantId = TenantContext.get();

        repo.findByTenantIdAndNameIgnoreCase(tenantId, request.name())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Category '" + existing.getName() + "' already exists");
                });

        TemplateCategory category = new TemplateCategory();
        category.setName(request.name());
        TemplateCategory saved = repo.save(category);
        return new TemplateCategoryResponse(saved.getId(), saved.getName());
    }

    @Override
    public void ensureCategoryExists(String category) {
        if (category == null || category.isBlank()) return;

        Long tenantId = TenantContext.get();
        String trimmed = category.trim();

        if (!repo.existsByTenantIdAndNameIgnoreCase(tenantId, trimmed)) {
            TemplateCategory newCategory = new TemplateCategory();
            newCategory.setName(trimmed);
            repo.save(newCategory);
        }
    }
}