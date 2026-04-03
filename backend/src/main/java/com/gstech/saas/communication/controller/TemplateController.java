package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.service.TemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/communications/templates")
@RequiredArgsConstructor
@Tag(name = "Template", description = "Template APIs")
public class TemplateController {

    private final TemplateService templateService;

    @Operation(summary = "Get all templates", description = "Retrieves all templates, optionally filtered by level.")
    @GetMapping
    public  ResponseEntity<?>  listTemplates(
            @RequestParam(required = false) Level level,
            @RequestParam(required = false)  Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "id") String sortBy) {

        if (page == null && size == null) {
            List<TemplateResponse> all = templateService.getAllTemplates(level);
            return ResponseEntity.ok(all);
        }

        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 10;
        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(sortBy));
        return ResponseEntity.ok(templateService.getTemplates(level, pageable));
    }

    @Operation(summary = "Create a new template", description = "Creates a new communication template with the provided details.")
    @PostMapping
    public TemplateResponse createTemplate(
            @RequestBody CreateTemplateRequest request) {
        return templateService.createTemplate(request);
    }

    @Operation(summary = "Update an existing template", description = "Updates an existing communication template with the provided details.")
    @PutMapping("/{id}")
    public TemplateResponse updateTemplate(
            @PathVariable Long id,
            @RequestBody UpdateTemplateRequest request) {
        return templateService.updateTemplate(id, request);
    }
    @Operation(summary = "Get template by ID")
    @GetMapping("/{id}")
    public TemplateResponse getTemplateById(@PathVariable Long id) {
        return templateService.getTemplateById(id);
    }

    @Operation(summary = "Delete a template by ID", description = "Deletes a specific communication template by its ID.")
    @DeleteMapping("/{id}")
    public void deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
    }

    @Operation(summary = "Delete multiple templates", description = "Deletes multiple communication templates by their IDs.")
    @DeleteMapping ("/batch")
    public void deleteTemplates(@RequestBody List<Long> ids) {
        templateService.deleteTemplatesByIds(ids);
    }

    @Operation(summary = "Resolve a template", description = "Processes a template by replacing {{variables}} with provided values.")
    @PostMapping("/resolve")
    public TemplateEngineResponse resolveTemplate(@RequestBody TemplateEngineRequest request) {
        return templateService.resolve(request);
    }
}