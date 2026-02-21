package com.gstech.saas.platform.security;

import java.io.IOException;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import com.gstech.saas.platform.tenant.multitenancy.TenantResolver;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private String USER_ID_HEADER_KEY = "x-user-id";
    private final SecretKey key;
    private final TenantResolver resolver;
    private final AuditService auditService;

    public JwtFilter(
            @Value("${jwt.secret}") String secret,
            TenantResolver resolver,
            AuditService auditService) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.resolver = resolver;
        this.auditService = auditService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                Long tokenTenantId = claims.get("tenantId", Long.class);
                String role = claims.get("role", String.class);
                Long userId = claims.get("user_id", Long.class);
                if (tokenTenantId == null || role == null) {
                    throw new JwtException("Invalid token claims");
                }
                if (!role.equals("PLATFORM_ADMIN")) {
                    if (!tokenTenantId.equals(TenantContext.get())) {
                        throw new JwtException("Tenant mismatch");
                    }
                }
                // overcome tight coupling of platform module it set user_id of authenticated
                // user so can be used in audit log
                if (userId != null) {
                    request.setAttribute(USER_ID_HEADER_KEY, userId);
                }
                List<GrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + role));
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        claims.getSubject(), null, authorities);

                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (JwtException ex) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid JWT token");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
