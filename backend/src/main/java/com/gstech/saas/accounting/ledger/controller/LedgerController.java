package com.gstech.saas.accounting.ledger.controller;

import com.gstech.saas.accounting.ledger.service.LedgerService;
import com.gstech.saas.accounting.ledger.dto.LedgerEntryResponse;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accounting/ledger")
@RequiredArgsConstructor
@Tag(name = "General Ledger", description = "Ledger entry query APIs")
public class LedgerController {

    private final LedgerService ledgerService;

    @Operation(summary = "Get ledger entries with optional filters",
               description = "All params optional. Returns all tenant entries when no filters provided.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<LedgerEntryResponse>>> getLedger(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String basis) {

        return ResponseEntity.ok(ApiResponse.success(
                ledgerService.getLedgerEntries(associationId, accountId, from, to, basis)));
    }
}
