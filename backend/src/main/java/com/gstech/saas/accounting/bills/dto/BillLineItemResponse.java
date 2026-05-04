package com.gstech.saas.accounting.bills.dto;

import java.math.BigDecimal;

public record BillLineItemResponse(
        String description,
        Long expenseAccountId,
        String expenseAccountName,
        BigDecimal amount
) {}