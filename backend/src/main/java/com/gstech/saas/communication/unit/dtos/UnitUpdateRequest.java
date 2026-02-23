package com.gstech.saas.communication.unit.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

public record UnitUpdateRequest(

                @Schema(description = "Unit number", example = "101") String unitNumber

) {

}
