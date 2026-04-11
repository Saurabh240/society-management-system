package com.gstech.saas.accounting.banking.controller;

import com.gstech.saas.accounting.banking.dto.BankAccountRequest;
import com.gstech.saas.accounting.banking.dto.BankAccountResponse;
import com.gstech.saas.accounting.banking.service.BankingService;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/accounting/banking")
@RequiredArgsConstructor
@Tag(name = "Banking", description = "Bank account management APIs")
public class BankingController {

    private final BankingService bankingService;

    @Operation(summary = "List bank accounts, optionally filtered by association")
    @GetMapping
    public ResponseEntity<ApiResponse<List<BankAccountResponse>>> list(
            @RequestParam(required = false) Long associationId) {

        return ResponseEntity.ok(ApiResponse.success(
                bankingService.listBankAccounts(associationId)));
    }

    @Operation(summary = "Add a new bank account")
    @PostMapping
    public ResponseEntity<ApiResponse<BankAccountResponse>> create(
            @Valid @RequestBody BankAccountRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(bankingService.createBankAccount(request)));
    }

    @Operation(summary = "Update a bank account")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BankAccountResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody BankAccountRequest request) {

        return ResponseEntity.ok(ApiResponse.success(
                bankingService.updateBankAccount(id, request)));
    }

    @Operation(summary = "Delete a bank account")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        bankingService.deleteBankAccount(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Update bank account balance (manual reconciliation)")
    @PatchMapping("/{id}/balance")
    public ResponseEntity<ApiResponse<BankAccountResponse>> updateBalance(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> body) {

        BigDecimal balance = body.get("balance");
        if (balance == null) {
            throw new IllegalArgumentException("balance field is required");
        }
        return ResponseEntity.ok(ApiResponse.success(
                bankingService.updateBalance(id, balance)));
    }
}
