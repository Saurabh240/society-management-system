package com.gstech.saas.platform.user.dto;

import com.gstech.saas.platform.user.model.UserStatus;

public record UpdateStatusRequest(
        UserStatus status
) {
}
