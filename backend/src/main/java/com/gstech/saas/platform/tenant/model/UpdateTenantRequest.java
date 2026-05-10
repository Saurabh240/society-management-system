package com.gstech.saas.platform.tenant.model;

import jakarta.validation.constraints.NotBlank;

public record UpdateTenantRequest(

        @NotBlank(message = "Name is required")
        String name,

        String streetAddress,
        String city,
        String state,
        String zipCode,
        String phone,
        String email,
        String accountOwner,
        String accountUrl,
        TenantStatus status
) {}