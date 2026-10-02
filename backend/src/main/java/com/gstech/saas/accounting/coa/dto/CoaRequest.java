package com.gstech.saas.accounting.coa.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CoaRequest(
        @Nullable String accountCode,
        @NotBlank String accountName,
        @NotNull AccountType accountType,
        String notes
) {}

