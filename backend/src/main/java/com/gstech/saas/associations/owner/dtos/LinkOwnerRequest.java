package com.gstech.saas.associations.owner.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for linking an existing owner to a unit")
public record LinkOwnerRequest(
        @Schema(description = "ID of the unit to link", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull(message = "Unit ID must not be null") Long unitId,
        @Schema(description = "Is owner a board member?", example = "false") Boolean isBoardMember) {

    public LinkOwnerRequest {
        if (isBoardMember == null) {
            isBoardMember = false;
        }
    }
}
