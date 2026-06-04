package com.gstech.saas.accounting.reports.dto;

import java.time.LocalDate;

public record DateRangeResult(
        LocalDate from,
        LocalDate to
) {
}