package com.gstech.saas.associations.vendor.dtos;

import com.gstech.saas.associations.vendor.enums.VendorStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record VendorRequest(

        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String companyName,
        @NotBlank String serviceCategory,
        @NotBlank @Email String email,
        String altEmail,
        String mobilePhone,
        String workPhone,
        String homePhone,
        String website,
        @NotBlank String street,
        @NotBlank String city,
        @NotBlank String state,
        @NotBlank String zipCode,
        String country,

        String taxIdentityType,
        String taxPayerId,

        String insuranceProvider,
        String policyNumber,
        LocalDate insuranceExpiry,

        String notes,

        @NotNull VendorStatus status
) {}