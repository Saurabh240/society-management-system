package com.gstech.saas.accounting.journal.dto;

import java.time.LocalDate;
import java.util.List;

public record JournalResponse(
        Long id,
        LocalDate date,
        Long associationId,
        String memo,
        String attachmentPath,
        List<JournalLineResponse> lines
) {}
