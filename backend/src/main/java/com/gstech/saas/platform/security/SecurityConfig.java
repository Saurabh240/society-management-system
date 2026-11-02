package com.gstech.saas.platform.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.gstech.saas.platform.tenant.multitenancy.TenantFilter;

import lombok.RequiredArgsConstructor;

import static org.springframework.http.HttpMethod.OPTIONS;

@RequiredArgsConstructor
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Value("${jwt.secret}")
    private String jwtSecret;

    // Comma-separated list of browser origins allowed to call the API. The default
    // covers the Vite dev server, CRA-style :3000, the nginx container on :80,
    // the Tailscale host and production.
    // Set app.cors.allowed-origins (or APP_CORS_ALLOWED_ORIGINS) in each environment.
    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost,https://hoa-app.tailfc43ba.ts.net,https://gsittech.com}")
    private List<String> allowedOrigins;

    private final TenantFilter tenantFilter;
    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public
                        .requestMatchers(OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/users/register",
                                "/users/login",
                                "/users/refresh",
                                "/users/reset-password",      // token-authenticated; caller has no JWT yet
                                "/users/check-company",       // company name availability check
                                "/v3/api-docs/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/swagger-resources/**",
                                "/swagger/**",
                                "/webjars/**",
                                "/actuator/**")
                        .permitAll()

                        // Plan endpoints — any authenticated tenant user
                        .requestMatchers("/api/v1/plan/**").authenticated()

                        // Platform admin only
                        .requestMatchers("/platform/**").hasRole("PLATFORM_ADMIN")
                        .requestMatchers("/tenant/admin/**").hasAnyRole("TENANT_ADMIN")

                        // Tenant Manager endpoints
                        .requestMatchers("/tenant/manager/**").hasAnyRole("TENANT_ADMIN", "MANAGER")

                        // Tenant View endpoints
                        .requestMatchers("/tenant/view/**").hasAnyRole("TENANT_ADMIN", "MANAGER", "VIEWER")

                        // User management — admins only (a VIEWER used to be able to
                        // invite admins and delete users).
                        .requestMatchers("/users/logout", "/users/roles").authenticated()
                        .requestMatchers("/users", "/users/**").hasAnyRole("TENANT_ADMIN", "PLATFORM_ADMIN")

                        // Business API: every authenticated tenant user may read;
                        // only TENANT_ADMIN / MANAGER may create, change or delete.
                        .requestMatchers("/api/v1/help/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/**").authenticated()
                        .requestMatchers("/api/v1/**").hasAnyRole("TENANT_ADMIN", "MANAGER", "PLATFORM_ADMIN")

                        // Anything else (e.g. /subscription) — any authenticated user
                        .anyRequest().authenticated())
                .addFilterBefore(tenantFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwtFilter, TenantFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
