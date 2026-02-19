package com.gstech.saas.platform.tenant.model;

import jakarta.validation.constraints.NotBlank;

public record CreateTenantRequest(
        @NotBlank String name,
        @NotBlank String subdomain
) {}

