package com.gstech.saas.platform.user.dto;

public record RegisterRequest(
        String email,
        String name,
        String password
) {}

