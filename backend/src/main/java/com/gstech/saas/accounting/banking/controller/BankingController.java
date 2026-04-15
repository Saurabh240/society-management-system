package com.gstech.saas.accounting.banking.controller;

import com.gstech.saas.accounting.banking.dto.BalanceUpdateRequest;
import com.gstech.saas.accounting.banking.dto.BankAccountRequest;
import com.gstech.saas.accounting.banking.dto.BankAccountResponse;
import com.gstech.saas.accounting.banking.service.BankingService;
import com.gstech.saas.platform.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accounting/banking")
@RequiredArgsConstructor
public class BankingController {

    private final BankingService bankingService;
    /**
     * GET /api/v1/accounting/banking?associationId=
     * Returns all bank accounts for the current tenant.
     * Optionally filtered by associationId.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BankAccountResponse>>> listAccounts(
            @RequestParam(required = false) Long associationId) {

        return ResponseEntity.ok(
                ApiResponse.success(bankingService.listAccounts(associationId)));
    }
    /**
     * GET /api/v1/accounting/banking/{id}
     * Returns a single account by id (Association, Account Name, masked number, Balance).
     * The transaction list below the header is served by the Ledger endpoint
     * filtered by accountId.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BankAccountResponse>> getAccountById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(bankingService.getAccountById(id)));
    }
    /**
     * POST /api/v1/accounting/banking
     * Creates a new bank account. Full account number is masked before saving.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BankAccountResponse>> createAccount(
            @Valid @RequestBody BankAccountRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(bankingService.createAccount(request)));
    }
    /**
     * PUT /api/v1/accounting/banking/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BankAccountResponse>> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody BankAccountRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(bankingService.updateAccount(id, request)));
    }
    /**
     * DELETE /api/v1/accounting/banking/{id}  →  204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        bankingService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
    /**
     * PATCH /api/v1/accounting/banking/{id}/balance
     * Manual reconciliation update by admin
     */
    @PatchMapping("/{id}/balance")
    public ResponseEntity<ApiResponse<BankAccountResponse>> updateBalance(
            @PathVariable Long id,
            @Valid @RequestBody BalanceUpdateRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        bankingService.updateBalance(id, request.balance())
                )
        );
    }
}