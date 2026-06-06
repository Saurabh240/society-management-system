package com.gstech.saas.platform.tenant.controller;

import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.tenant.model.TenantResponse;
import com.gstech.saas.platform.tenant.model.UpdateTenantRequest;
import com.gstech.saas.platform.tenant.service.TenantService;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Tenant-admin-scoped account endpoints.
 *
 * Path prefix /tenant/admin/** is secured to ROLE_TENANT_ADMIN
 * in SecurityConfig — PLATFORM_ADMIN cannot use these endpoints.
 *
 * A TENANT_ADMIN can read and update their OWN tenant account info
 * without needing to pass a tenantId — it is always read from TenantContext.
 */
@RestController
@RequestMapping("/tenant/admin/account")
@RequiredArgsConstructor
@Tag(name = "Settings — Account", description = "Tenant admin account info management")
public class TenantAccountController {

    private final TenantService tenantService;

    @Operation(
            summary = "Get own tenant account info",
            description = "Returns the account information for the currently authenticated tenant admin."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<TenantResponse>> getMyAccount() {
        Long tenantId = TenantContext.get();
        return ResponseEntity.ok(ApiResponse.success(tenantService.get(tenantId)));
    }

    @Operation(
            summary = "Update own tenant account info",
            description = "Updates company name, address, contact info, account owner and URL."
    )
    @PutMapping
    public ResponseEntity<ApiResponse<TenantResponse>> updateMyAccount(
            @Valid @RequestBody UpdateTenantRequest request) {
        Long tenantId = TenantContext.get();
        return ResponseEntity.ok(ApiResponse.success(tenantService.updateTenant(tenantId, request)));
    }
}