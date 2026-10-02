package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.CreateTemplateCategoryRequest;
import com.gstech.saas.communication.dto.TemplateCategoryResponse;
import com.gstech.saas.communication.service.TemplateCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/communications/template-categories")
@RequiredArgsConstructor
@Tag(name = "Template Category", description = "Template Category APIs")
public class TemplateCategoryController {

    private final TemplateCategoryService templateCategoryService;

    @Operation(summary = "List template categories", description = "Retrieves all known template categories for the tenant.")
    @GetMapping
    public List<TemplateCategoryResponse> listCategories() {
        return templateCategoryService.getCategories();
    }

    @Operation(summary = "Create a new template category", description = "Adds a new category, for the \"create new category if not in the list\" flow.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TemplateCategoryResponse createCategory(@Valid @RequestBody CreateTemplateCategoryRequest request) {
        return templateCategoryService.createCategory(request);
    }
}