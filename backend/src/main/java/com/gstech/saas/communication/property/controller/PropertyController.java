package com.gstech.saas.communication.property.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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

import com.gstech.saas.communication.property.dtos.PropertyResponse;
import com.gstech.saas.communication.property.dtos.PropertySaveRequest;
import com.gstech.saas.communication.property.dtos.PropertyUpdateRequest;
import com.gstech.saas.communication.property.service.PropertyService;
import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.common.HeaderConstant;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
@Tag(name = "Property", description = "Property API")
public class PropertyController {
    private final PropertyService propertyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new property", description = "Create a new property")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Property created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Tenant ID not found or Community not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Property name already exists in community")
    })
    public ApiResponse<PropertyResponse> createProperty(@Valid @RequestBody PropertySaveRequest propertySaveRequest,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        return ApiResponse.success(propertyService.save(propertySaveRequest, userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get property by id", description = "Get property by id")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Property retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ApiResponse<PropertyResponse> getProperty(@PathVariable Long id) {
        return ApiResponse.success(propertyService.get(id));
    }

    @GetMapping
    @Operation(summary = "Get all properties", description = "Get all properties")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Properties retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ApiResponse<List<PropertyResponse>> getAllProperties() {
        return ApiResponse.success(propertyService.getAllProperties());
    }

    @GetMapping("/community/{communityId}")
    @Operation(summary = "Get all properties by community id", description = "Get all properties by community id")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Properties retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ApiResponse<List<PropertyResponse>> getAllPropertiesByCommunityId(@PathVariable Long communityId) {
        return ApiResponse.success(propertyService.getAllPropertiesByCommunityId(communityId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete property", description = "Delete property")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Property deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ApiResponse<Void> deleteProperty(@PathVariable Long id,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        propertyService.delete(id, userId);
        return ApiResponse.success(null);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update property", description = "Update property")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Property updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Property not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Property name already exists in community")
    })
    public ApiResponse<PropertyResponse> updateProperty(@PathVariable Long id,
            @Valid @RequestBody PropertyUpdateRequest propertyUpdateRequest,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {
        return ApiResponse.success(propertyService.update(id, propertyUpdateRequest, userId));
    }
}
