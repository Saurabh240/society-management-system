package com.gstech.saas.accounting.ledger.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class UnitLedgerSummaryResponse {

    private BigDecimal currentBalance;
    private BigDecimal totalCharges;
    private BigDecimal totalPayments;
}