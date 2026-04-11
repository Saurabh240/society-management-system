package com.gstech.saas.accounting.journal.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record JournalResponse(
    Long id,
    Long associationId,
    LocalDate date,
    String memo,
    List<JournalLineResponse> lines,
    Instant createdAt
) {}
