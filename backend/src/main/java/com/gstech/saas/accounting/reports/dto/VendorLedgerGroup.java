package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.util.List;

public record VendorLedgerGroup(
        Long       vendorId,
        String     vendorName,
        String     serviceCategory,
        BigDecimal totalBilled,
        BigDecimal totalPaid,
        BigDecimal closingBalance,
        List<VendorLedgerRow> transactions
) {}