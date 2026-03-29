package com.gstech.saas.platform.user.model;

public record RefreshResponse(
        String accessToken,
        String refreshToken

) {}
