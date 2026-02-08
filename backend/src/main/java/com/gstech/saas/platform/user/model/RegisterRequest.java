package com.gstech.saas.platform.user.model;

public record RegisterRequest(
        String email,
        String password
) {}

