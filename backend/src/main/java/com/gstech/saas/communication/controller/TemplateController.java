package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.service.TemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/communications/templates")
@RequiredArgsConstructor
@Tag(name = "Template", description = "Communication template management APIs")
public class TemplateController {

    private final TemplateService templateService;

    @Operation(summary = "Get all templates", description = "Retrieves all templates, optionally filtered by level.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Templates retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping
    public List<TemplateResponse> listTemplates(
            @RequestParam(required = false) Level level) {
        return templateService.getTemplates(level);
    }

    @Operation(summary = "Create a new template", description = "Creates a new communication template with the provided details.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Template created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @PostMapping
    public TemplateResponse createTemplate(
            @RequestBody CreateTemplateRequest request) {
        return templateService.createTemplate(request);
    }

    @Operation(summary = "Update an existing template", description = "Updates an existing communication template with the provided details.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Template updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Template not found")
    })
    @PutMapping("/{id}")
    public TemplateResponse updateTemplate(
            @PathVariable Long id,
            @RequestBody UpdateTemplateRequest request) {
        return templateService.updateTemplate(id, request);
    }

    @Operation(summary = "Delete a template by ID", description = "Deletes a specific communication template by its ID.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Template deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Template not found")
    })
    @DeleteMapping("/{id}")
    public void deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
    }

    @Operation(summary = "Delete multiple templates", description = "Deletes multiple communication templates by their IDs.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Templates deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @DeleteMapping ("/batch")
    public void deleteTemplates(@RequestBody List<Long> ids) {
        templateService.deleteTemplatesByIds(ids);
    }
    @Operation(summary = "Resolve a template", description = "Processes a template by replacing {{variables}} with provided values.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Template resolved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Template not found")
    })
    @PostMapping("/resolve")
    public TemplateEngineResponse resolveTemplate(@RequestBody TemplateEngineRequest request) {
        return templateService.resolve(request);
    }
}