package com.gstech.saas.accounting.ledger.controller;

import com.gstech.saas.accounting.ledger.dto.LedgerFilter;
import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.dto.LedgerEntryResponse;
import com.gstech.saas.accounting.ledger.dto.LedgerStatementResponse;
import com.gstech.saas.accounting.ledger.service.LedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
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
     *     &page=0&size=20
     *
     * All params are optional. Returns paginated ledger entries with
     * account names resolved from CoA.
     */
    @GetMapping
    public ResponseEntity<Page<LedgerEntryResponse>> getLedgerEntries(
            @ModelAttribute LedgerFilter filter,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(ledgerService.getLedgerEntries(filter, pageable));
    }

    /**
     * GET /api/v1/accounting/ledger/statement?accountId=&from=&to=&type=DEPOSIT|PAYMENT&basis=
     * One account's transactions with a running balance (bank-register style).
     */
    @GetMapping("/statement")
    public ResponseEntity<LedgerStatementResponse> getStatement(
            @RequestParam Long accountId,
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) AccountingBasis basis) {

        return ResponseEntity.ok(
                ledgerService.getAccountStatement(accountId, associationId, from, to, type, basis));
    }
}
