package com.gstech.saas.communication.owner.controller;

import java.util.List;

import com.gstech.saas.communication.owner.dtos.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gstech.saas.communication.owner.service.OwnerService;
import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.common.HeaderConstant;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/owner")
@RequiredArgsConstructor
@Tag(name = "Owner", description = "Owner management APIs")
public class OwnerController {

    private final OwnerService ownerService;

    @Operation(summary = "Create a new owner")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Owner created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ApiResponse<OwnerListResponseType> create(
            @RequestBody @Valid OwnerSaveRequest saveRequest,
            HttpServletRequest request, @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        return ApiResponse.success(ownerService.save(saveRequest, userId));
    }

    @Operation(summary = "Update an existing owner")
    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{id}")
    public ApiResponse<OwnerListResponseType> update(@PathVariable Long id,
            @RequestBody @Valid OwnerUpdateRequest updateRequest,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        return ApiResponse.success(ownerService.update(id, updateRequest, userId));
    }

    @Operation(summary = "Get owner by id, unit, and association")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/unit/{unitId}/association/{associationId}")
    public ApiResponse<OwnerDetailedResponse> get(
            @PathVariable @NotNull(message = "id cannot be null") Long id,
            @PathVariable @NotNull(message = "unitId cannot be null") Long unitId,
            @PathVariable @NotNull(message = "associationId cannot be null") Long associationId) {
        return ApiResponse.success(ownerService.get(id, unitId, associationId));
    }

    @Operation(summary = "Get all owners by tenant")
    @GetMapping("/all")
    public ApiResponse<List<OwnerUnitRowResponse>> getOwnersForTable() {
        return ApiResponse.success(ownerService.getOwnersForTable());
    }

    @Operation(summary = "Get owners by unit")
    @GetMapping("/unit/{unitId}")
    public ApiResponse<List<OwnerListResponseType>> getByUnit(@PathVariable Long unitId) {
        return ApiResponse.success(ownerService.getOwnersByUnit(unitId));
    }

    @Operation(summary = "Get board members by association")
    @GetMapping("/board-members/{associationId}")
    public ApiResponse<List<OwnerListResponseType>> getBoardMembers(@PathVariable Long associationId) {
        return ApiResponse.success(ownerService.getBoardMembersByAssociation(associationId));
    }

    @Operation(summary = "Delete an owner")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<?> delete(@PathVariable @NotNull(message = "id cannot be null") Long id,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        ownerService.delete(id, userId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "Link an existing owner to a unit")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Owner linked to unit successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or Unit not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Owner not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Owner is already linked to this unit")
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{id}/link-unit")
    public ApiResponse<Void> linkUnit(
            @PathVariable @NotNull(message = "id cannot be null") Long id,
            @RequestBody @Valid LinkOwnerRequest linkRequest,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        ownerService.linkOwnerToUnit(id, linkRequest, userId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "Update unit owner link (e.g. board member status)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Owner link updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or Unit not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Owner or link not found")
    })
    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{id}/units/{unitId}")
    public ApiResponse<Void> updateUnitOwner(
            @PathVariable @NotNull(message = "id cannot be null") Long id,
            @PathVariable @NotNull(message = "unitId cannot be null") Long unitId,
            @RequestBody @Valid UpdateUnitOwnerRequest updateRequest,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        ownerService.updateUnitOwner(id, unitId, updateRequest, userId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "Remove an owner from a unit")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Owner removed from unit successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or Unit not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Owner or link not found")
    })
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}/units/{unitId}")
    public ApiResponse<Void> removeOwnerFromUnit(
            @PathVariable @NotNull(message = "id cannot be null") Long id,
            @PathVariable @NotNull(message = "unitId cannot be null") Long unitId,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        ownerService.removeOwnerFromUnit(id, unitId, userId);
        return ApiResponse.success(null);
    }
}
