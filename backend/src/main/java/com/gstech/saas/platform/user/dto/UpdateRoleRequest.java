package com.gstech.saas.platform.user.dto;

import com.gstech.saas.platform.security.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
        @NotNull(message = "Role is required")
        Role role
) {}