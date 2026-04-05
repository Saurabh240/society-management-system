package com.gstech.saas.platform.user.dto;

public record LoginRequest(
        String email,
        String password
) {}

