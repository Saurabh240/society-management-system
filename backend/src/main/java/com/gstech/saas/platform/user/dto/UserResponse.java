package com.gstech.saas.platform.user.dto;

import com.gstech.saas.platform.security.Role;
import com.gstech.saas.platform.user.model.UserStatus;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        Role role,
        UserStatus status
) {}

