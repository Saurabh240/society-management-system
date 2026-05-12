package com.gstech.saas.platform.user.dto;

public record ResetPasswordRequest(
        String token,
        String newPassword
) {}
