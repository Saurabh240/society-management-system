package com.gstech.saas.platform.tenant.controller;

import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.tenant.model.TenantResponse;
import com.gstech.saas.platform.tenant.model.UpdateTenantRequest;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import com.gstech.saas.platform.tenant.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tenant")
@RequiredArgsConstructor
@Tag(name = "Tenant Self-Service", description = "Tenant users view and update their own account info")
public class TenantSelfController {

    private final TenantService tenantService;

    @Operation(summary = "Get own tenant info",
            description = "Returns the account info for the currently authenticated tenant.")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<TenantResponse>> getMyTenant() {
        Long tenantId = TenantContext.get();
        TenantResponse response = tenantService.get(tenantId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Update own tenant info",
            description = "Updates account info (name, address, phone, email, URL) for the current tenant.")
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<TenantResponse>> updateMyTenant(
            @Valid @RequestBody UpdateTenantRequest request) {
        Long tenantId = TenantContext.get();
        TenantResponse response = tenantService.updateTenant(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}