package com.gstech.saas.platform.tenant.controller;

import com.gstech.saas.platform.tenant.model.CreateTenantRequest;
import com.gstech.saas.platform.tenant.model.TenantResponse;
import com.gstech.saas.platform.tenant.model.UpdateTenantRequest;
import com.gstech.saas.platform.tenant.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/platform/tenants")   // 🔐 secured by SecurityConfig
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public TenantResponse createTenant(@Valid @RequestBody CreateTenantRequest request) {
        return tenantService.createTenant(request);
    }
    @Operation(
            summary = "Update tenant account information",
            description = "Updates tenant profile including address, contact info, account owner and URL."
    )
    @PutMapping("/{id}")
    public ResponseEntity<TenantResponse> updateTenant(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTenantRequest request) {
        return ResponseEntity.ok(tenantService.updateTenant(id, request));
    }

    @GetMapping
    public List<TenantResponse> listTenants() {
        return tenantService.getAllTenants();
    }

    @GetMapping("/{id}")
    public TenantResponse getTenantById(@PathVariable Long id) {
        return tenantService.get(id);
    }
}
