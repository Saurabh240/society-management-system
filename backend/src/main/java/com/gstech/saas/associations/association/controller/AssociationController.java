package com.gstech.saas.associations.association.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import com.gstech.saas.associations.association.dtos.AssociationDetailedResponse;
import com.gstech.saas.associations.association.dtos.AssociationListResponseType;
import com.gstech.saas.associations.association.dtos.AssociationSaveRequest;
import com.gstech.saas.associations.association.dtos.AssociationUpdateRequest;
import com.gstech.saas.associations.association.service.AssociationService;
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
@RequestMapping("/api/v1/associations")
@RequiredArgsConstructor
@Tag(name = "Association", description = "Association management APIs")
public class AssociationController {

        private final AssociationService associationService;

        @Operation(summary = "Create association")
        @PostMapping
        public ResponseEntity<ApiResponse<AssociationListResponseType>> create(
                @RequestBody @Valid AssociationSaveRequest request,
                @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                return ResponseEntity
                        .status(HttpStatus.CREATED)      // 201 for resource creation, not 200
                        .body(ApiResponse.success(associationService.save(request, userId)));
        }

        @Operation(summary = "Update association")
        @PatchMapping("/{id}")
        public ResponseEntity<ApiResponse<AssociationListResponseType>> update(
                @PathVariable Long id,
                @RequestBody @Valid AssociationUpdateRequest request,
                @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                return ResponseEntity.ok(ApiResponse.success(associationService.update(id, request, userId)));
        }

        @Operation(summary = "Get association by ID")
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<AssociationDetailedResponse>> get(@PathVariable Long id) {
                return ResponseEntity.ok(ApiResponse.success(associationService.get(id)));
        }

        @Operation(summary = "Get all associations")
        @GetMapping
        public ResponseEntity<ApiResponse<List<AssociationListResponseType>>> getAll() {
                return ResponseEntity.ok(ApiResponse.success(associationService.getAllAssociations()));
        }

        @Operation(summary = "Delete association")
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> delete(
                @PathVariable Long id,
                @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                associationService.delete(id, userId);
                return ResponseEntity.ok(ApiResponse.success(null));
        }
}
