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
@Tag(name = "Budgets", description = "Budget management and line item operations")
public class BudgetController {

    private final BudgetService budgetService;

    // ── POST /api/v1/accounting/budgets ───────────────────────────────────────
    @PostMapping
    @Operation(summary = "Create a new budget")
    public ResponseEntity<ApiResponse<BudgetResponse>> create(
            @Valid @RequestBody CreateBudgetRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(budgetService.create(request)));
    }

    // ── GET /api/v1/accounting/budgets ────────────────────────────────────────
    @GetMapping
    @Operation(summary = "List all budgets with optional filters")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> list(
            @RequestParam(required = false) Long    associationId,
            @RequestParam(required = false) Integer fiscalYear
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        budgetService.list(associationId, fiscalYear)));
    }

    // ── GET /api/v1/accounting/budgets/{id} ───────────────────────────────────
    @GetMapping("/{id}")
    @Operation(summary = "Get a budget by ID")
    public ResponseEntity<ApiResponse<BudgetResponse>> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(budgetService.getById(id)));
    }

    // ── PUT /api/v1/accounting/budgets/{id} ───────────────────────────────────
    @PutMapping("/{id}")
    @Operation(summary = "Update budget header (name, dates, status, notes)")
    public ResponseEntity<ApiResponse<BudgetResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBudgetRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(budgetService.update(id, request)));
    }

    // ── DELETE /api/v1/accounting/budgets/{id} ────────────────────────────────
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a budget (only DRAFT or CLOSED)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        budgetService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── GET /api/v1/accounting/budgets/{id}/line-items ────────────────────────
    @GetMapping("/{id}/line-items")
    @Operation(summary = "Get all line items for a budget")
    public ResponseEntity<ApiResponse<List<BudgetLineItemResponse>>> getLineItems(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(budgetService.getLineItems(id)));
    }

    // ── PUT /api/v1/accounting/budgets/{id}/line-items ────────────────────────
    @PutMapping("/{id}/line-items")
    @Operation(summary = "Replace all line items for a budget")
    public ResponseEntity<ApiResponse<List<BudgetLineItemResponse>>> replaceLineItems(
            @PathVariable Long id,
            @Valid @RequestBody List<BudgetLineItemRequest> lineItems
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        budgetService.replaceLineItems(id, lineItems)));
    }
}