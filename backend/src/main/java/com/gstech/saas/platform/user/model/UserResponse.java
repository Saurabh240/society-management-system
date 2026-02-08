package com.gstech.saas.platform.user.model;

import com.gstech.saas.platform.security.Role;

public record UserResponse(
        Long id,
        String email,
        Role role
) {}

