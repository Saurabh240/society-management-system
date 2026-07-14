package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CashFlowResponse(
        LocalDate  from,
        LocalDate  to,
        String     accountingBasis,
        BigDecimal netCashFromOperating,
        BigDecimal netCashFromInvesting,
        BigDecimal netCashFromFinancing,
        BigDecimal netChangeInCash,
        BigDecimal openingCashBalance,
        BigDecimal closingCashBalance,
        List<CashFlowRow> operating,
        List<CashFlowRow> investing,
        List<CashFlowRow> financing
) {}