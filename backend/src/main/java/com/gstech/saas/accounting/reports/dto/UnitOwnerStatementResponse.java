package com.gstech.saas.accounting.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record UnitOwnerStatementResponse(
        Long unitId,
        String unitNumber,
        String associationName,
        String ownerName,
        String ownerEmail,
        LocalDate from,
        LocalDate to,
        BigDecimal openingBalance,
        BigDecimal totalCharges,
        BigDecimal totalPayments,
        BigDecimal closingBalance,
        List<StatementRow> transactions
) {}