package com.gstech.saas.associations.owner.dtos;

import com.gstech.saas.associations.owner.enums.BoardDesignation;

import java.time.Instant;
import java.time.LocalDate;

public record BoardMemberResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        Long tenantId,
        Instant createdAt,
        Long unitId,
        String unitNumber,
        BoardDesignation designation,
        LocalDate termStartDate,
        LocalDate termEndDate
) {}