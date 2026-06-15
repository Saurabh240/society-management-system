package com.gstech.saas.platform.user.dto;

import com.gstech.saas.platform.security.Role;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank String email,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String password,
        Role role,
        @NotBlank String companyName,
        String streetAddress,
        String city,
        String state,
        String zipCode,
        String phone,
        String companyEmail,
        String accountUrl
) {}

