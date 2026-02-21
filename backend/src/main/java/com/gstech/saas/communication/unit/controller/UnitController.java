package com.gstech.saas.communication.unit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.gstech.saas.communication.unit.dtos.UnitResponse;
import com.gstech.saas.communication.unit.dtos.UnitSaveRequest;
import com.gstech.saas.communication.unit.dtos.UnitUpdateRequest;
import com.gstech.saas.communication.unit.service.UnitService;
import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.common.HeaderConstant;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/units")
@RequiredArgsConstructor
@Tag(name = "Unit", description = "Unit API")
public class UnitController {
        private final UnitService unitService;

        @PostMapping
        @Operation(summary = "Create a new unit", description = "Create a new unit")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Unit created successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @PreAuthorize("isAuthenticated()")
        @ResponseStatus(HttpStatus.CREATED)
        public ApiResponse<UnitResponse> createUnit(
                        @Valid @RequestBody UnitSaveRequest unitSaveRequest,
                        @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                return ApiResponse.success(
                                unitService.save(unitSaveRequest, userId));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get unit by id", description = "Get unit by id")
        @PreAuthorize("isAuthenticated()")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Unit retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Unit not found")
        })
        public ApiResponse<UnitResponse> getUnit(@PathVariable Long id) {
                return ApiResponse.success(unitService.get(id));
        }

        @GetMapping("/property/{propertyId}")
        @Operation(summary = "Get all units by property id", description = "Get all units by property id")
        @PreAuthorize("isAuthenticated()")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Units retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Property not found")
        })
        public ApiResponse<List<UnitResponse>> getAllUnitsByPropertyId(
                        @PathVariable Long propertyId) {
                return ApiResponse.success(unitService.getAllUnitsByPropertyId(propertyId));
        }

        @GetMapping
        @Operation(summary = "Get all units by tenant id", description = "Get all units by tenant id")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Units retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @PreAuthorize("isAuthenticated()")
        public ApiResponse<List<UnitResponse>> getAllUnitsByTenantId() {
                return ApiResponse.success(unitService.getAllUnitsByTenantId());
        }

        @PatchMapping("/{id}")
        @Operation(summary = "Update unit", description = "Update unit")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Unit updated successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Unit not found")
        })
        @PreAuthorize("isAuthenticated()")
        public ApiResponse<UnitResponse> updateUnit(@PathVariable Long id,
                        @Valid @RequestBody UnitUpdateRequest unitUpdateRequest,
                        @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                return ApiResponse.success(unitService.update(id, unitUpdateRequest, userId));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Delete unit", description = "Delete unit")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Unit deleted successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Unit not found")
        })
        @PreAuthorize("isAuthenticated()")
        public ApiResponse<Void> deleteUnit(@PathVariable Long id,
                        @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                unitService.delete(id, userId);
                return ApiResponse.success(null);
        }

}
