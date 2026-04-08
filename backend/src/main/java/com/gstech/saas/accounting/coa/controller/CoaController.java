package com.gstech.saas.accounting.coa.controller;

import com.gstech.saas.accounting.coa.dto.CoaRequest;
import com.gstech.saas.accounting.coa.dto.CoaResponse;
import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.service.CoaService;
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
    @GetMapping
    public ResponseEntity<Page<CoaResponse>> listAccounts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AccountType type,
            @PageableDefault(size = 20, sort = "accountCode") Pageable pageable) {

        return ResponseEntity.ok(coaService.listAccounts( search, type, pageable));
    }

    /**
     * POST /api/v1/accounting/coa
     */
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
    @PutMapping("/{id}")
    public ResponseEntity<CoaResponse> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody CoaRequest request) {

        return ResponseEntity.ok(coaService.updateAccount( id, request));
    }

    /**
     * DELETE /api/v1/accounting/coa/{id}  →  204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long id) {

        coaService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}