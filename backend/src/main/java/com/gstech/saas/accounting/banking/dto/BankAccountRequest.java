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

        // defaults to "United States" if not provided
        String country,

        @NotBlank(message = "Routing number is required")
        String routingNumber,
        /**
         * Full account number — only last 4 digits are persisted as "****XXXX".
         * The full number is discarded after masking. Never stored in the DB.
         */
        @NotBlank(message = "Account number is required")
        String accountNumber,
        String accountNotes,
        Boolean checkPrintingEnabled,
        @PositiveOrZero(message = "Balance must be zero or positive")
        BigDecimal balance
) {}