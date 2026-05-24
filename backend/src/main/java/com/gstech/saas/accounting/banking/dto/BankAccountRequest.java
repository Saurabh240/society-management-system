package com.gstech.saas.accounting.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Request DTO for creating or updating a bank account.
 *
 * Account number handling:
 * - On CREATE: accountNumber is required (@NotBlank enforced in service).
 *   The full number is masked to "****XXXX" before saving — never stored in full.
 *
 * - On UPDATE: accountNumber is optional. Set changeAccountNumber = true AND
 *   provide the new full accountNumber to update it. If changeAccountNumber is
 *   false (or null), the existing masked value is kept — accountNumber is ignored.
 *
 * This avoids the UI having to re-send the masked value through mask() again,
 * which was producing "****XXXX" being treated as a real account number.
 */
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
         * Full account number.
         * - Required on CREATE (validated in service, not here, so updates can omit it).
         * - Only used on UPDATE when changeAccountNumber = true.
         * - Never stored in the DB. Immediately discarded after masking.
         */
        String accountNumber,

        /**
         * Set to true on UPDATE to replace the stored masked account number.
         * When false (default), accountNumber is ignored and the existing masked
         * value is preserved unchanged.
         * Ignored on CREATE — account number is always required on create.
         */
        Boolean changeAccountNumber,

        String accountNotes,
        Boolean checkPrintingEnabled,

        @PositiveOrZero(message = "Balance must be zero or positive")
        BigDecimal balance
) {}