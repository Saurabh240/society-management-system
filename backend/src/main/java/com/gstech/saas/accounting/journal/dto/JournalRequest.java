package com.gstech.saas.accounting.journal.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record JournalRequest(

    @NotNull(message = "Association is required")
    Long associationId,

    @NotNull(message = "Date is required")
    LocalDate date,

    String memo,

    @NotEmpty(message = "At least one journal line is required")
    @Valid
    List<JournalLineRequest> lines
) {}
