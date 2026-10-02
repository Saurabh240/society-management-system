package com.gstech.saas.associations.vendor.dtos;

import com.gstech.saas.associations.vendor.enums.VendorStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record VendorRequest(

        @NotNull Boolean isCompany,
        String firstName,               // Required if isCompany = false
        String lastName,                // Required if isCompany = false
        String companyName,             // Required if isCompany = true
        @NotBlank String serviceCategory,
        @NotBlank @Email String email,
        String altEmail,
        String mobilePhone,
        String workPhone,
        String homePhone,
        String website,
        @NotBlank String street,
        @NotBlank String city,
        @NotBlank @Pattern(regexp = "^[A-Z]{2}$", message = "State must be a valid 2-letter US state/territory code") String state,
        @NotBlank String zipCode,
        String country,

        String taxIdentityType,
        String taxPayerId,

        String insuranceProvider,
        String policyNumber,
        LocalDate insuranceExpiry,

        String notes,

        Long defaultExpenseAccountId,   // Optional FK to Coa (EXPENSES type)

        @NotNull VendorStatus status
) {}