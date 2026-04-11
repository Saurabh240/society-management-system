package com.gstech.saas.accounting.journal.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CreateJournalRequest(
        @NotNull LocalDate date,
        @NotNull Long associationId,
        String memo,
        String attachmentPath,
        @NotEmpty List<JournalLineRequest> lines
) {}
