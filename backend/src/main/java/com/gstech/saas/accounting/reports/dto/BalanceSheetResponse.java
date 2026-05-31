package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BalanceSheetResponse(

        LocalDate asOfDate,
        Long associationId,
        List<BalanceSheetLineItem> assets,
        List<BalanceSheetLineItem> liabilities,
        List<BalanceSheetLineItem> equity,
        BigDecimal totalAssets,
        BigDecimal totalLiabilities,
        BigDecimal totalEquity,
        BigDecimal equationDifference,
        boolean balanced
) {}