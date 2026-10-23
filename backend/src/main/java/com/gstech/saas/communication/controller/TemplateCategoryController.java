package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.CreateTemplateCategoryRequest;
import com.gstech.saas.communication.dto.TemplateCategoryResponse;
import com.gstech.saas.communication.service.TemplateCategoryService;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/communications/template-categories")
@RequiredArgsConstructor
@Tag(name = "Template Categories", description = "Template Category APIs")
public class TemplateCategoryController {

    private final TemplateCategoryService templateCategoryService;

    @Operation(summary = "Get all template categories", description = "Retrieves all template categories for the current tenant.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TemplateCategoryResponse>>> listCategories() {
        List<TemplateCategoryResponse> categories = templateCategoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @Operation(summary = "Create a new template category", description = "Creates a new template category. If the category already exists, returns the existing one without creating a duplicate.")
    @PostMapping
    public ResponseEntity<ApiResponse<TemplateCategoryResponse>> createCategory(
            @Valid @RequestBody CreateTemplateCategoryRequest request) {
        TemplateCategoryResponse category = templateCategoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(category));
    }

    @Operation(summary = "Get template category by ID", description = "Retrieves a specific template category by its ID.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateCategoryResponse>> getCategoryById(@PathVariable Long id) {
        TemplateCategoryResponse category = templateCategoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @Operation(summary = "Delete a template category", description = "Deletes a specific template category by its ID.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        templateCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
