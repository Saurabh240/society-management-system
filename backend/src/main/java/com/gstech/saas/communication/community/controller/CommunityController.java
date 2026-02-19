package com.gstech.saas.communication.community.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gstech.saas.communication.community.dtos.CommunityResponse;
import com.gstech.saas.communication.community.dtos.CommunitySaveRequest;
import com.gstech.saas.communication.community.dtos.CommunityUpdateRequest;
import com.gstech.saas.communication.community.service.CommunityService;
import com.gstech.saas.platform.common.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
@Tag(name = "Community", description = "Community management APIs")
public class CommunityController {
    private String USER_ID_HEADER_KEY = "x-user-id";
    private final CommunityService communityService;

    @Operation(summary = "Create a new community", description = "Creates a new community with the provided details.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Community created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ApiResponse<CommunityResponse> create(@RequestBody @Valid CommunitySaveRequest communitySaveRequest,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID_HEADER_KEY);
        return ApiResponse.success(
                communityService.save(communitySaveRequest, userId));
    }

    @Operation(summary = "Update an existing community", description = "Updates an existing community with the provided details.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Community updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Community not found")
    })
    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{id}")
    public ApiResponse<CommunityResponse> update(@PathVariable Long id,
            @RequestBody @Valid CommunityUpdateRequest communityUpdateRequest, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID_HEADER_KEY);
        return ApiResponse.success(
                communityService.update(id, communityUpdateRequest, userId));
    }

    @Operation(summary = "Get community by ID", description = "Retrieves the details of a specific community by its ID.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Community retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Community not found")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ApiResponse<CommunityResponse> get(@PathVariable @NotNull(message = "id cannot be null") Long id) {
        return ApiResponse.success(
                communityService.get(id));
    }

    @Operation(summary = "Get all communities by tenant", description = "Retrieves a list of all communities.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Communities retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/all")
    public ApiResponse<List<CommunityResponse>> getAll() {
        return ApiResponse.success(
                communityService.getAllCommunities());
    }

    @Operation(summary = "Delete a community", description = "Deletes a specific community by its ID.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Community deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Community not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<?> delete(@PathVariable @NotNull(message = "id cannot be null") Long id,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID_HEADER_KEY);
        communityService.delete(id, userId);
        return ApiResponse.success(null);
    }

}
