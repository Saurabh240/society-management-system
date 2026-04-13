package com.gstech.saas.accounting.ledger.dto;


import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

public record LedgerFilter(
        Long associationId,
        Long accountId,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        AccountingBasis basis
) {}