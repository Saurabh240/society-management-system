package com.gstech.saas.associations.unit.controller;

import java.util.List;

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

import com.gstech.saas.associations.unit.dtos.UnitDetailedResponse;
import com.gstech.saas.associations.unit.dtos.UnitResponse;
import com.gstech.saas.associations.unit.dtos.UnitSaveRequest;
import com.gstech.saas.associations.unit.dtos.UnitUpdateRequest;
import com.gstech.saas.associations.unit.dtos.UpdateOccupancyRequest;
import com.gstech.saas.associations.unit.service.UnitService;
import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.common.HeaderConstant;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/units")
@RequiredArgsConstructor
@Tag(name = "Unit", description = "Unit management APIs")
public class UnitController {

        private final UnitService unitService;

        @PostMapping
        @Operation(summary = "Create unit")
        public ResponseEntity<ApiResponse<UnitResponse>> createUnit(
                @Valid @RequestBody UnitSaveRequest request,
                @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                return ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body(ApiResponse.success(unitService.save(request, userId)));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get unit by ID")
        public ResponseEntity<ApiResponse<UnitDetailedResponse>> getUnit(@PathVariable Long id) {
                return ResponseEntity.ok(ApiResponse.success(unitService.get(id)));
        }

        @GetMapping("/association/{associationId}")
        @Operation(summary = "Get all units by association")
        public ResponseEntity<ApiResponse<List<UnitResponse>>> getAllByAssociation(
                @PathVariable Long associationId) {
                return ResponseEntity.ok(ApiResponse.success(unitService.getAllUnitsByAssociationId(associationId)));
        }

        @GetMapping
        @Operation(summary = "Get all units for current tenant")
        public ResponseEntity<ApiResponse<List<UnitResponse>>> getAllByTenant() {
                return ResponseEntity.ok(ApiResponse.success(unitService.getAllUnitsByTenantId()));
        }

        @PatchMapping("/{id}")
        @Operation(summary = "Update unit")
        public ResponseEntity<ApiResponse<UnitResponse>> updateUnit(
                @PathVariable Long id,
                @Valid @RequestBody UnitUpdateRequest request,
                @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                return ResponseEntity.ok(ApiResponse.success(unitService.update(id, request, userId)));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Delete unit")
        public ResponseEntity<ApiResponse<Void>> deleteUnit(
                @PathVariable Long id,
                @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                unitService.delete(id, userId);
                return ResponseEntity.ok(ApiResponse.success(null));
        }

        @PatchMapping("/{id}/occupancy")
        @Operation(summary = "Update unit occupancy status")
        public ResponseEntity<ApiResponse<UnitResponse>> updateOccupancy(
                @PathVariable Long id,
                @Valid @RequestBody UpdateOccupancyRequest request,
                @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                return ResponseEntity.ok(ApiResponse.success(unitService.updateOccupancy(id, request, userId)));
        }
}
