package com.gstech.saas.platform.Tenant.multitenancy;

import com.gstech.saas.platform.Tenant.repository.TenantRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class TenantResolver {

    private final TenantRepository tenantRepository;

    public TenantResolver(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    public Long resolve(HttpServletRequest request) {

        String host = request.getServerName(); // acme.app.com

        if (host == null || !host.contains(".")) {
            throw new RuntimeException("Invalid host");
        }

        String subdomain = host.split("\\.")[0];

        return tenantRepository
                .findBySubdomain(subdomain)
                .orElseThrow(() -> new RuntimeException("Invalid tenant"))
                .getId();
    }
}


