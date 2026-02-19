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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
@Tag(name = "Property", description = "Property API")
public class PropertyController {
    private final String USER_ID_HEADER_KEY = "x-user-id";
    private final PropertyService propertyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new property", description = "Create a new property")
    public ApiResponse<PropertyResponse> createProperty(@Valid @RequestBody PropertySaveRequest propertySaveRequest,
            @RequestAttribute(USER_ID_HEADER_KEY) Long userId) {
        return ApiResponse.success(propertyService.save(propertySaveRequest, userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get property by id", description = "Get property by id")
    public ApiResponse<PropertyResponse> getProperty(@PathVariable Long id) {
        return ApiResponse.success(propertyService.get(id));
    }

    @GetMapping
    @Operation(summary = "Get all properties", description = "Get all properties")
    public ApiResponse<List<PropertyResponse>> getAllProperties() {
        return ApiResponse.success(propertyService.getAllProperties());
    }

    @GetMapping("/community/{communityId}")
    @Operation(summary = "Get all properties by community id", description = "Get all properties by community id")
    public ApiResponse<List<PropertyResponse>> getAllPropertiesByCommunityId(@PathVariable Long communityId) {
        return ApiResponse.success(propertyService.getAllPropertiesByCommunityId(communityId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete property", description = "Delete property")
    public ApiResponse<Void> deleteProperty(@PathVariable Long id, @RequestAttribute(USER_ID_HEADER_KEY) Long userId) {
        propertyService.delete(id, userId);
        return ApiResponse.success(null);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update property", description = "Update property")
    public ApiResponse<PropertyResponse> updateProperty(@PathVariable Long id,
            @Valid @RequestBody PropertyUpdateRequest propertyUpdateRequest,
            @RequestAttribute(USER_ID_HEADER_KEY) Long userId) {
        return ApiResponse.success(propertyService.update(id, propertyUpdateRequest, userId));
    }
}
