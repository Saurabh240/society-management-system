package com.gstech.saas.platform.user.dto;

import com.gstech.saas.platform.security.Role;
import jakarta.validation.constraints.NotBlank;

public record InviteUserRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String email,
        Role role
){}
