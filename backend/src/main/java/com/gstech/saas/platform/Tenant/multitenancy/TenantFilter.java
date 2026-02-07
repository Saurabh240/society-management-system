package com.gstech.saas.platform.Tenant.multitenancy;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1) // 👈 VERY IMPORTANT
public class TenantFilter extends OncePerRequestFilter {

    private final TenantResolver resolver;

    public TenantFilter(TenantResolver resolver) {
        this.resolver = resolver;
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
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}

