package com.gstech.saas.platform.tenant.multitenancy;

import com.gstech.saas.platform.tenant.repository.TenantRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
public class TenantResolver {

    private final TenantRepository tenantRepository;
    private final SecretKey jwtKey;
    private final String baseDomain;

    public TenantResolver(
            TenantRepository tenantRepository,
            @Value("${jwt.secret}") String jwtSecret,
            // Apex domain whose subdomains are tenants (company1.<base-domain> -> "company1").
            // Override per environment with app.tenant.base-domain / APP_TENANT_BASE_DOMAIN.
            @Value("${app.tenant.base-domain:gsittech.com}") String baseDomain) {
        this.tenantRepository = tenantRepository;
        this.jwtKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        this.baseDomain = baseDomain.trim().toLowerCase();
    }

    public Long resolve(HttpServletRequest request) {

        String host = request.getServerName();
        String h = host == null ? null : host.toLowerCase();

        // ── Tenant subdomain ──────────────────────────────────────────────────
        // Only "<sub>.<base-domain>" (or "<sub>.localhost" for local testing) is treated
        // as a tenant host. The bare domain, www, localhost, IP addresses, docker service
        // names and other hostnames (e.g. a Tailscale name) are platform hosts: they go
        // straight to the JWT / self-signup path below. An unknown subdomain never throws.
        boolean platformHost =
                h == null
                        || h.equals("localhost")
                        || h.equals("127.0.0.1")
                        || h.equals(baseDomain)
                        || h.equals("www." + baseDomain);

        if (!platformHost && (h.endsWith("." + baseDomain) || h.endsWith(".localhost"))) {
            String subdomain = h.split("\\.")[0];
            var tenant = tenantRepository.findBySubdomain(subdomain);
            if (tenant.isPresent()) {
                return tenant.get().getId();
            }
        }

        // Main platform domain:
        // authenticated requests get tenantId from JWT
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(jwtKey)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                Long tenantId = claims.get("tenantId", Long.class);
                if (tenantId != null) {
                    return tenantId;
                }
            } catch (Exception ignored) {
            }
        }

        // Public platform requests such as signup/check-company
        return 0L;
    }

}