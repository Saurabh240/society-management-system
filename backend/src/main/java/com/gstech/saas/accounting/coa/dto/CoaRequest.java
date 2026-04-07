package com.gstech.saas.accounting.coa.dto;

public record CoaRequest (
     String accountCode,
     String accountName,
     AccountType accountType,
     String notes)
{}

