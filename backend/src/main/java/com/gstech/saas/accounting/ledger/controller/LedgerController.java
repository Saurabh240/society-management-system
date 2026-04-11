package com.gstech.saas.accounting.ledger.controller;

import com.gstech.saas.accounting.ledger.dto.LedgerFilter;
import com.gstech.saas.accounting.ledger.dto.LedgerRequest;
import com.gstech.saas.accounting.ledger.dto.LedgerResponse;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.service.LedgerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/accounting/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    /**
     * GET /api/v1/accounting/ledger
     *     ?associationId=&accountId=&from=2024-01-01&to=2024-12-31&basis=CASH|ACCRUAL
     */
    @GetMapping
    public ResponseEntity<Page<LedgerResponse>> listEntries(
            @ModelAttribute LedgerFilter filter,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(ledgerService.listEntries(filter, pageable));
    }

    /**
     * POST /api/v1/accounting/ledger
     */
    @PostMapping
    public ResponseEntity<LedgerResponse> createEntry(
            @Valid @RequestBody LedgerRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ledgerService.createEntry(request));
    }
}