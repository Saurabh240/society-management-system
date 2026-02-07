package com.gstech.saas.platform.user.model;

public record UserResponse(
        Long id,
        String email,
        String role
) {}

