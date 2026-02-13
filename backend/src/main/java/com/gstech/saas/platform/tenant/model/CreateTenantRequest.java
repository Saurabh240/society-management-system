package com.gstech.saas.platform.tenant.model;

public record CreateTenantRequest(
        String name,
        String subdomain
) {}

