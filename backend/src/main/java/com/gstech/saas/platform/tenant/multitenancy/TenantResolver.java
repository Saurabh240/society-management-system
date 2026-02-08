package com.gstech.saas.platform.tenant.multitenancy;

import com.gstech.saas.platform.tenant.repository.TenantRepository;
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

        if (host.equals("localhost")) {
            return 1L; // Default tenant for local development
        }

        if (host == null) {
            throw new RuntimeException("Invalid host");
        }

        String subdomain = host.split("\\.")[0];

        return tenantRepository
                .findBySubdomain(subdomain)
                .orElseThrow(() -> new RuntimeException("Invalid tenant"))
                .getId();
    }
}


