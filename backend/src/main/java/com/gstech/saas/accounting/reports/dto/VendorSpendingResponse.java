package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record VendorSpendingResponse(
        LocalDate from,
        LocalDate to,
        BigDecimal totalSpent,
        List<VendorSpendingRow> vendors
) {}