package com.gstech.saas.associations.vendor.dtos;

import com.gstech.saas.associations.vendor.enums.VendorStatus;
import java.time.Instant;

public record VendorResponse(

        Long id,
        String companyName,
        String contactName,
        String email,
        String phone,
        String altEmail,
        String altPhone,
        String street,
        String city,
        String state,
        String zipCode,
        VendorStatus status,
        String serviceCategory,
        Instant createdAt,
        Instant updatedAt
) {}