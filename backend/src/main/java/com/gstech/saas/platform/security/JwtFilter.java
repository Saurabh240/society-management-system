package com.gstech.saas.platform.security;

import com.gstech.saas.platform.Tenant.multitenancy.TenantContext;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;

public class JwtFilter extends OncePerRequestFilter {

    private final SecretKey key;

    public JwtFilter(String secret) {
        byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

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

                if (tokenTenantId == null || role == null) {
                    throw new JwtException("Invalid token claims");
                }

                if (!tokenTenantId.equals(TenantContext.get())) {
                    throw new JwtException("Tenant mismatch");
                }

                List<GrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + role)
                );

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
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

