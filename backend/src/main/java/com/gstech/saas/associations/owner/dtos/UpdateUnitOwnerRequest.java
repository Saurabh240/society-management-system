package com.gstech.saas.associations.owner.dtos;

import java.time.LocalDate;

import com.gstech.saas.associations.owner.enums.BoardDesignation;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for updating an owner-unit link")
public record UpdateUnitOwnerRequest(

        @Schema(description = "Is board member?")
        Boolean isBoardMember,

        @Schema(description = "Board designation — required when isBoardMember is true")
        BoardDesignation designation,

        @Schema(description = "Term start date")
        LocalDate termStartDate,

        @Schema(description = "Term end date")
        LocalDate termEndDate
) {}