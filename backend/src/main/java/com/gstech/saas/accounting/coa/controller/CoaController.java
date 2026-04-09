package com.gstech.saas.accounting.coa.controller;

import com.gstech.saas.accounting.coa.dto.CoaRequest;
import com.gstech.saas.accounting.coa.dto.CoaResponse;
import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.service.CoaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/accounting/coa")
@RequiredArgsConstructor
public class CoaController {

    private final CoaService coaService;

    /**
     * GET /api/v1/accounting/coa?search=&type=&page=&size=&sort=
     */
    @Operation(
            summary = "List all accounts",
            description = "Fetch paginated list of chart of accounts with optional search and type filters"
    )
    @GetMapping
    public ResponseEntity<Page<CoaResponse>> listAccounts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AccountType type,
            @PageableDefault(size = 20, sort = "accountCode") Pageable pageable) {

        return ResponseEntity.ok(coaService.listAccounts( search, type, pageable));
    }

    /**
     * GET /api/v1/accounting/coa/{id}
     */
    @Operation(
            summary = "Get account by ID",
            description = "Fetch a single chart of account by ID"
    )
    @GetMapping("/{id}")
    public ResponseEntity<CoaResponse> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(coaService.getAccount(id));
    }

    /**
     * POST /api/v1/accounting/coa
     */
    @Operation(
            summary = "Create a new account",
            description = "Creates a new chart of account with the provided details"
    )
    @PostMapping
    public ResponseEntity<CoaResponse> createAccount(
            @Valid @RequestBody CoaRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(coaService.createAccount( request));
    }

    /**
     * PUT /api/v1/accounting/coa/{id}
     */
    @Operation(
            summary = "Update an account",
            description = "Updates an existing chart of account by ID"
    )
    @PutMapping("/{id}")
    public ResponseEntity<CoaResponse> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody CoaRequest request) {

        return ResponseEntity.ok(coaService.updateAccount( id, request));
    }

    /**
     * DELETE /api/v1/accounting/coa/{id}  →  204 No Content
     */
    @Operation(
            summary = "Delete an account",
            description = "Soft deletes a chart of account by ID"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long id) {

        coaService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}