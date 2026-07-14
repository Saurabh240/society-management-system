package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;

public record CashFlowRow(
        String     description,   // accountName used as description (matches screenshot)
        BigDecimal amount         // positive = inflow, negative = outflow
) {}