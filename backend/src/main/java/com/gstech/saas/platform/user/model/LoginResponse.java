package com.gstech.saas.platform.user.model;

public record LoginResponse(
        String accessToken,
        String role
) {}


