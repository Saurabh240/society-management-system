package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateTemplateCategoryRequest;
import com.gstech.saas.communication.dto.TemplateCategoryResponse;
import java.util.List;

public interface TemplateCategoryService {
    List<TemplateCategoryResponse> getCategories();
    TemplateCategoryResponse createCategory(CreateTemplateCategoryRequest request);

    // Called by TemplateServiceImpl on create/update so an arbitrary
    // category string used there always ends up in the lookup too.
    void ensureCategoryExists(String category);
}