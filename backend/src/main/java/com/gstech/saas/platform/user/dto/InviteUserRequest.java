package com.gstech.saas.platform.user.dto;

import com.gstech.saas.platform.security.Role;

public record InviteUserRequest(
        String name,
        String email,
        Role role
){}
