package com.gstech.saas.platform.User.model;

public record LoginRequest(
        String email,
        String password
) {}

