package com.gstech.saas.accounting.bills.dto;

import java.math.BigDecimal;

public record BillLineItemRequest(
        String description,
        Long expenseAccountId,
        BigDecimal amount
) {}