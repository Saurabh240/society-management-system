package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AssessmentHistoryResponse(
        LocalDate from,
        LocalDate to,
        BigDecimal totalAssessed,
        BigDecimal totalCollected,
        BigDecimal collectionRate,
        List<AssessmentHistoryRow> assessments
) {}