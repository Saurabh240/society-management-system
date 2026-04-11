package com.gstech.saas.accounting.journal.controller;

import com.gstech.saas.accounting.journal.dto.JournalRequest;
import com.gstech.saas.accounting.journal.service.JournalService;
import com.gstech.saas.accounting.journal.dto.JournalResponse;
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
@RequestMapping("/api/v1/accounting/journal-entries")
@RequiredArgsConstructor
@Tag(name = "Journal Entries", description = "General journal entry APIs")
public class JournalController {

    private final JournalService journalService;

    @Operation(summary = "Record a new general journal entry",
               description = "Debits must equal credits — unbalanced entries are rejected with 400")
    @PostMapping
    public ResponseEntity<ApiResponse<JournalResponse>> create(
            @Valid @RequestBody JournalRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(journalService.createJournalEntry(request)));
    }

    @Operation(summary = "List all journal entries for the current tenant")
    @GetMapping
    public ResponseEntity<ApiResponse<List<JournalResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(journalService.listJournalEntries()));
    }
}
