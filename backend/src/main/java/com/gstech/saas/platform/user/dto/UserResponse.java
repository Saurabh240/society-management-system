package com.gstech.saas.platform.user.dto;

import com.gstech.saas.platform.security.Role;
import com.gstech.saas.platform.user.model.UserStatus;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        UserStatus status
) {}

