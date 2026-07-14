package com.gstech.saas.accounting.budget.controller;

import com.gstech.saas.accounting.budget.dto.*;
import com.gstech.saas.accounting.budget.service.BudgetService;
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
@RequestMapping("/api/v1/accounting/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Budget management — CRUD and line items")
public class BudgetController {

    private final BudgetService budgetService;

    @Operation(summary = "List all budgets", description = "Pass ?associationId= to filter. " +
            "Returns budgets without line items — use GET /{id} for detail.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> list(
            @RequestParam(required = false) Long associationId) {
        return ResponseEntity.ok(ApiResponse.success(budgetService.list(associationId)));
    }

    @Operation(summary = "Get a budget with all line items")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(budgetService.get(id)));
    }

    @Operation(summary = "Create a new budget", description = "Optionally include lineItems. Status defaults to DRAFT.")
    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> create(
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(budgetService.create(request)));
    }

    @Operation(summary = "Update budget header and optionally replace line items",
            description = "Cannot modify a CLOSED budget.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(ApiResponse.success(budgetService.update(id, request)));
    }

    @Operation(summary = "Replace all line items for a budget",
            description = "Clears existing items and saves the new list.")
    @PutMapping("/{id}/line-items")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateLineItems(
            @PathVariable Long id, @Valid @RequestBody List<BudgetLineItemRequest> items) {
        return ResponseEntity.ok(ApiResponse.success(budgetService.updateLineItems(id, items)));
    }

    @Operation(summary = "Delete a budget and all its line items")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        budgetService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}