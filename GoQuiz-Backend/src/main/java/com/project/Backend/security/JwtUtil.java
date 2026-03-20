package com.project.Backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key SECRET_KEY = Keys.hmacShaKeyFor("jdhjbdehvsdjvbshjbvhdnewifm09324kmvkknvdejvsn_jkbf".getBytes());
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 2; // 2 hour

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role) 
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return getClaims(token).getBody().getSubject();
    }
    
    public String extractRole(String token) {
        return getClaims(token).getBody().get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = getClaims(token).getBody();
            return !claims.getExpiration().before(new Date());  // Explicit expiration check
        } catch (ExpiredJwtException e) {
            System.out.println("Token expired: " + e.getMessage());
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("Invalid token: " + e.getMessage());
            return false;
        }
    }

    private Jws<Claims> getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token);
    }
}
