package com.gstech.saas.associations.owner.dtos;

import com.gstech.saas.associations.owner.enums.BoardDesignation;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import static io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED;

@Schema(description = "Request payload for linking an owner to a unit")
public record LinkOwnerRequest(

        @Schema(description = "Unit ID to link", requiredMode = REQUIRED)
        @NotNull(message = "Unit ID must not be null")
        Long unitId,

        @Schema(description = "Is board member?", example = "false")
        Boolean isBoardMember,

        @Schema(description = "Board designation — required when isBoardMember is true")
        BoardDesignation designation
) {
    public LinkOwnerRequest {
        if (isBoardMember == null) isBoardMember = false;
    }
}
