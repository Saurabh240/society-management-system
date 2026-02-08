package com.gstech.saas.platform.user.model;

public record LoginRequest(
        String email,
        String password
) {}

