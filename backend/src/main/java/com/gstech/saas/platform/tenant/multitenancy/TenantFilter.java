package com.gstech.saas.platform.tenant.multitenancy;

import com.gstech.saas.platform.audit.service.AuditService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1)
public class TenantFilter extends OncePerRequestFilter {

    private final TenantResolver resolver;
    private final AuditService auditService;

    public TenantFilter(TenantResolver resolver,AuditService auditService) {
        this.resolver = resolver;
        this.auditService =auditService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        try {
            Long tenantId = resolver.resolve(request);
            TenantContext.set(tenantId);

            auditService.log(
                    "TENANT_RESOLVED",
                    "Tenant",
                    tenantId,
                    null
            );

            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }

    }
}

