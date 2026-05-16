package com.gstech.saas.platform.user.dto;

import com.gstech.saas.platform.security.Role;

public record RegisterRequest(
        String email,
        String name,
        String password,
        Role role
) {}

