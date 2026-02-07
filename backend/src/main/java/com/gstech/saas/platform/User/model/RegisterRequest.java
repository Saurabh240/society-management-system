package com.gstech.saas.platform.User.model;

public record RegisterRequest(
        String email,
        String password
) {}

