package com.gstech.saas.accounting.ledger.controller;

import com.gstech.saas.accounting.ledger.dto.LedgerFilter;
import com.gstech.saas.accounting.ledger.dto.LedgerEntryResponse;
import com.gstech.saas.accounting.ledger.service.LedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}

