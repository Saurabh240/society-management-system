package com.gstech.saas.accounting.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record BankAccountRequest(

        @NotNull(message = "associationId is required")
        Long associationId,

        @NotBlank(message = "Bank account name is required")
        @Size(max = 255)
        String bankAccountName,

        @NotNull(message = "Account type is required")
        BankAccountType accountType,

        String country,

        @NotBlank(message = "Routing number is required")
        String routingNumber,

        String accountNumber,

        Boolean changeAccountNumber,

        String accountNotes,
        Boolean checkPrintingEnabled,

        @PositiveOrZero(message = "Balance must be zero or positive")
        BigDecimal balance
) {}