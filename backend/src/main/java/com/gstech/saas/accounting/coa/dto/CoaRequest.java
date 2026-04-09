package com.gstech.saas.accounting.coa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CoaRequest(
        @NotBlank String accountCode,
        @NotBlank String accountName,
        @NotNull AccountType accountType,
        String notes
) {}

