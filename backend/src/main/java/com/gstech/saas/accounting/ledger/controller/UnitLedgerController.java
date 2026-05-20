package com.gstech.saas.accounting.ledger.controller;

import com.gstech.saas.accounting.ledger.dto.UnitLedgerEntryResponse;
import com.gstech.saas.accounting.ledger.dto.UnitLedgerSummaryResponse;
import com.gstech.saas.accounting.ledger.dto.UnitLedgerTransactionRequest;
import com.gstech.saas.accounting.ledger.dto.UnitLedgerTransactionType;
import com.gstech.saas.accounting.ledger.service.UnitLedgerService;
import com.gstech.saas.platform.common.ApiResponse;
import org.springframework.data.domain.Page;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/units/{unitId}/ledger")
@RequiredArgsConstructor
@Tag(name = "Unit Ledger", description = "Unit-scoped ledger viewing APIs")
public class UnitLedgerController {

    private final UnitLedgerService unitLedgerService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<UnitLedgerSummaryResponse>> getSummary(
            @PathVariable Long unitId) {

        return ResponseEntity.ok(
                ApiResponse.success(unitLedgerService.getSummary(unitId))
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UnitLedgerEntryResponse>>> getTransactions(
            @PathVariable Long unitId,
            UnitLedgerTransactionRequest request,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        unitLedgerService.getTransactions(
                                unitId,
                                request.getFrom(),
                                request.getTo(),
                                request.getType(),
                                pageable
                        )
                )
        );
    }
}