package com.gstech.saas.platform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenProvider {

    private final String SECRET = "U0KxucF0VYLvJEm2LnDk2L9ueBmTScTf3pdwtB3iHBg=";
    private final long EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

    public String generateToken(Long tenantId, String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("tenantId", tenantId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    public Claims validateAndGetClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody();
    }
}
