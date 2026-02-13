package com.gstech.saas.platform.tenant.controller;

import com.gstech.saas.platform.tenant.model.CreateTenantRequest;
import com.gstech.saas.platform.tenant.model.TenantResponse;
import com.gstech.saas.platform.tenant.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/platform/tenants")   // 🔐 secured by SecurityConfig
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public TenantResponse createTenant(@RequestBody CreateTenantRequest request) {
        return tenantService.createTenant(request);
    }

    @GetMapping
    public List<TenantResponse> listTenants() {
        return tenantService.getAllTenants();
    }
}

