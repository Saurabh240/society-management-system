package com.gstech.saas.platform.tenant.service;

import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.tenant.model.CreateTenantRequest;
import com.gstech.saas.platform.tenant.model.TenantResponse;
import com.gstech.saas.platform.tenant.model.Tenant;
import com.gstech.saas.platform.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    public TenantResponse createTenant(CreateTenantRequest request) {

        if (tenantRepository.existsBySubdomain(request.subdomain())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tenant subdomain already exists");
        }

        Tenant tenant = new Tenant();
        tenant.setName(request.name());
        tenant.setSubdomain(request.subdomain());
        tenant.setStatus(request.status());

        Tenant saved = tenantRepository.save(tenant);
        auditService.log(
                "TENANT_CREATED",
                "Tenant",
                saved.getId(),
                null
        );

        return mapToResponse(tenant);
    }

    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TenantResponse get(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));
        return mapToResponse(tenant);
    }

    private TenantResponse mapToResponse(Tenant tenant) {
        return new TenantResponse(
                tenant.getId(),
                tenant.getName(),
                tenant.getSubdomain(),
                tenant.getStatus()
        );
    }
}
