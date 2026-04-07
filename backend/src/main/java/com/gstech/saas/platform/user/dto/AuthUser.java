package com.gstech.saas.platform.user.dto;


import com.gstech.saas.platform.security.Role;

public record AuthUser(
        Long userId,
        String email,
        Role role
) {}
