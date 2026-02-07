package com.gstech.saas.platform.User.model;

public record LoginResponse(
        String accessToken,
        String role
) {}


