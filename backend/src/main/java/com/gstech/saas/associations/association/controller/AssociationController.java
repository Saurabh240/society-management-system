package com.gstech.saas.associations.association.controller;

import java.util.List;

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
@RequestMapping("/association")
@RequiredArgsConstructor
@Tag(name = "Association", description = "Association management APIs")
public class AssociationController {
        private final AssociationService communityService;

        @Operation(summary = "Create a new association", description = "Creates a new association with the provided details.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Association created successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @PreAuthorize("isAuthenticated()")
        @PostMapping
        public ApiResponse<AssociationListResponseType> create(
                        @RequestBody @Valid AssociationSaveRequest communitySaveRequest,
                        HttpServletRequest request, @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                return ApiResponse.success(
                                communityService.save(communitySaveRequest, userId));
        }

        @Operation(summary = "Update an existing association", description = "Updates an existing association with the provided details.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Association updated successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Community not found")
        })
        @PreAuthorize("isAuthenticated()")
        @PatchMapping("/{id}")
        public ApiResponse<AssociationListResponseType> update(@PathVariable Long id,
                        @RequestBody @Valid AssociationUpdateRequest communityUpdateRequest,
                        @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                return ApiResponse.success(
                                communityService.update(id, communityUpdateRequest, userId));
        }

        @Operation(summary = "Get association by ID", description = "Retrieves the details of a specific association by its ID.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Association retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Association not found")
        })
        @PreAuthorize("isAuthenticated()")
        @GetMapping("/{id}")
        public ApiResponse<AssociationDetailedResponse> get(
                        @PathVariable @NotNull(message = "id cannot be null") Long id) {
                return ApiResponse.success(
                                communityService.get(id));
        }

        @Operation(summary = "Get all associations by tenant", description = "Retrieves a list of all associations.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Associations retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping("/all")
        public ApiResponse<List<AssociationListResponseType>> getAll() {
                return ApiResponse.success(
                                communityService.getAllAssociations());
        }

        @Operation(summary = "Delete a association", description = "Deletes a specific association by its ID.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Association deleted successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Association not found")
        })
        @DeleteMapping("/{id}")
        @PreAuthorize("isAuthenticated()")
        public ApiResponse<?> delete(@PathVariable @NotNull(message = "id cannot be null") Long id,
                        @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
                communityService.delete(id, userId);
                return ApiResponse.success(null);
        }

}
