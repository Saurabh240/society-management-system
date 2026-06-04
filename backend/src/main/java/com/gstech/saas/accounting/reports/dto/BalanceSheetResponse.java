package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BalanceSheetResponse(
        LocalDate asOfDate,
        String accountingBasis,
        BigDecimal totalAssets,
        BigDecimal totalLiabilities,
        BigDecimal totalEquity,
        BigDecimal totalLiabilitiesAndEquity,
        boolean isBalanced,
        List<ReportLineItem> assets,
        List<ReportLineItem> liabilities,
        List<ReportLineItem> equity
) {}
