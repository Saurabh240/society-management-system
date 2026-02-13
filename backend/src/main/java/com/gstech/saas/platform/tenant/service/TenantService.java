package com.gstech.saas.platform.tenant.service;

import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.tenant.model.CreateTenantRequest;
import com.gstech.saas.platform.tenant.model.TenantResponse;
import com.gstech.saas.platform.tenant.model.Tenant;
import com.gstech.saas.platform.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    public TenantResponse createTenant(CreateTenantRequest request) {

        if (tenantRepository.existsBySubdomain(request.subdomain())) {
            throw new RuntimeException("Subdomain already exists");
        }

        Tenant tenant = new Tenant();
        tenant.setName(request.name());
        tenant.setSubdomain(request.subdomain());

        tenantRepository.save(tenant);
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

    private TenantResponse mapToResponse(Tenant tenant) {
        return new TenantResponse(
                tenant.getId(),
                tenant.getName(),
                tenant.getSubdomain()
        );
    }
}

