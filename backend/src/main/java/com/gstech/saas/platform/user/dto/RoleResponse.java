package com.gstech.saas.platform.user.dto;

public record RoleResponse(
        String role,
        String permissionLabel,
        long userCount
) {}