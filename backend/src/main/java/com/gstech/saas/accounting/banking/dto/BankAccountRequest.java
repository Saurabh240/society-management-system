package com.gstech.saas.accounting.banking.dto;

import com.gstech.saas.accounting.banking.model.BankAccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record BankAccountRequest(

    @NotNull(message = "Association is required")
    Long associationId,

    @NotBlank(message = "Bank account name is required")
    String bankAccountName,

    @NotNull(message = "Account type is required")
    BankAccountType accountType,

    String country,

    @NotBlank(message = "Routing number is required")
    @Pattern(regexp = "\\d{9}", message = "Routing number must be exactly 9 digits")
    String routingNumber,

    // Full account number sent from frontend — masked before saving to DB
    @NotBlank(message = "Account number is required")
    String accountNumber,

    String accountNotes,

    Boolean checkPrintingEnabled,

    BigDecimal balance
) {}
