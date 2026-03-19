package com.gstech.saas.associations.owner.controller;

import java.util.List;

import com.gstech.saas.associations.owner.dtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gstech.saas.associations.owner.service.OwnerService;
import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.common.HeaderConstant;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/owners")
@RequiredArgsConstructor
@Tag(name = "Owner", description = "Owner management APIs")
public class OwnerController {

    private final OwnerService ownerService;

    @PostMapping
    @Operation(summary = "Create owner")
    public ResponseEntity<ApiResponse<OwnerListResponseType>> create(
            @RequestBody @Valid OwnerSaveRequest request,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(ownerService.save(request, userId)));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update owner")
    public ResponseEntity<ApiResponse<OwnerListResponseType>> update(
            @PathVariable Long id,
            @RequestBody @Valid OwnerUpdateRequest request,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.update(id, request, userId)));
    }

    @GetMapping("/{id}/unit/{unitId}/association/{associationId}")
    @Operation(summary = "Get owner details by owner, unit, and association")
    public ResponseEntity<ApiResponse<OwnerDetailedResponse>> get(
            @PathVariable Long id,
            @PathVariable Long unitId,
            @PathVariable Long associationId) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.get(id, unitId, associationId)));
    }

    @GetMapping
    @Operation(summary = "Get all owners for current tenant")
    public ResponseEntity<ApiResponse<List<OwnerUnitRowResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(ownerService.getOwnersForTable()));
    }

    @GetMapping("/unit/{unitId}")
    @Operation(summary = "Get owners by unit")
    public ResponseEntity<ApiResponse<List<OwnerListResponseType>>> getByUnit(
            @PathVariable Long unitId) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.getOwnersByUnit(unitId)));
    }

    @GetMapping("/board-members/{associationId}")
    @Operation(summary = "Get board members by association")
    public ResponseEntity<ApiResponse<List<OwnerListResponseType>>> getBoardMembers(
            @PathVariable Long associationId) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.getBoardMembersByAssociation(associationId)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete owner")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        ownerService.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/link-unit")
    @Operation(summary = "Link owner to a unit")
    public ResponseEntity<ApiResponse<Void>> linkUnit(
            @PathVariable Long id,
            @RequestBody @Valid LinkOwnerRequest request,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        ownerService.linkOwnerToUnit(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{id}/units/{unitId}")
    @Operation(summary = "Update owner-unit link")
    public ResponseEntity<ApiResponse<Void>> updateUnitOwner(
            @PathVariable Long id,
            @PathVariable Long unitId,
            @RequestBody @Valid UpdateUnitOwnerRequest request,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        ownerService.updateUnitOwner(id, unitId, request, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}/units/{unitId}")
    @Operation(summary = "Remove owner from unit")
    public ResponseEntity<ApiResponse<Void>> removeOwnerFromUnit(
            @PathVariable Long id,
            @PathVariable Long unitId,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        ownerService.removeOwnerFromUnit(id, unitId, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}