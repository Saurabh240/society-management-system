package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;

public record VendorSpendingRow(
        Long vendorId,
        String vendorName,
        String serviceCategory,
        int billCount,
        BigDecimal totalBilled,
        BigDecimal totalPaid,
        BigDecimal outstanding
) {}