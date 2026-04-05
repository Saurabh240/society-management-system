package com.gstech.saas.platform.user.dto;

public record LoginResponse(
        String accessToken,
        String role
) {}


