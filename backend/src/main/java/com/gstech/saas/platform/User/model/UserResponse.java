package com.gstech.saas.platform.User.model;

public record UserResponse(
        Long id,
        String email,
        String role
) {}

