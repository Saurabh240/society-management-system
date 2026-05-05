package com.gstech.saas.associations.vendor.dtos;

import com.gstech.saas.associations.vendor.enums.VendorStatus;
import java.time.Instant;
import java.time.LocalDate;

public record VendorResponse(
        Long id,
        // Basic Info
        String firstName,
        String lastName,
        String companyName,
        String serviceCategory,
        // Contact Info
        String email,
        String altEmail,
        String mobilePhone,
        String workPhone,
        String homePhone,
        String website,
        // Address
        String street,
        String city,
        String state,
        String zipCode,
        String country,
        // Tax Info
        String taxIdentityType,
        String taxPayerId,
        // Insurance
        String insuranceProvider,
        String policyNumber,
        LocalDate insuranceExpiry,
        // Additional
        String notes,
        VendorStatus status,
        Instant createdAt
) {}