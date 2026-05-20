package com.gstech.saas.accounting.ledger.dto;

import com.gstech.saas.accounting.ledger.dto.UnitLedgerTransactionType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class UnitLedgerTransactionRequest {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate to;

    private UnitLedgerTransactionType type = UnitLedgerTransactionType.ALL;
}