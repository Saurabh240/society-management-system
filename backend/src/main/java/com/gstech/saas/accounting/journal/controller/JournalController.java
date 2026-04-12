package com.gstech.saas.accounting.journal.controller;

import com.gstech.saas.accounting.journal.dto.CreateJournalRequest;
import com.gstech.saas.accounting.journal.dto.JournalResponse;
import com.gstech.saas.platform.common.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gstech.saas.accounting.journal.model.Journal;
import com.gstech.saas.accounting.journal.service.JournalService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accounting/journal-entries")
@RequiredArgsConstructor
@Tag(name = "Journal Entries", description = "General Journal APIs")
public class JournalController {

    private final JournalService journalService;

    @PostMapping
    public ResponseEntity<ApiResponse<JournalResponse>> create(
            @Valid @RequestBody CreateJournalRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(journalService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JournalResponse>>> list(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        journalService.list(associationId, from, to, pageable)
                )
        );
    }
}

