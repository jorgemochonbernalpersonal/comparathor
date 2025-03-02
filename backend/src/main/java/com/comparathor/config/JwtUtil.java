package com.comparathor.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {
    private static final Dotenv dotenv = Dotenv.load();

    private final String secretKeyString = dotenv.get("JWT_SECRET", "supersecurekey123");
    private final Key secretKey;

    private final long expirationTime = Long.parseLong(dotenv.get("JWT_EXPIRATION", "900000")); // 15 min

    public JwtUtil() {
        if (secretKeyString.length() < 32) {
            throw new IllegalArgumentException("🚨 ERROR: JWT_SECRET debe tener al menos 32 caracteres para HS256.");
        }
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }

    public String generateToken(Long userId, String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .claim("roles", List.of(role))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public List<String> extractRoles(String token) {
        return (List<String>) extractClaims(token).get("roles");
    }

    public boolean validateToken(String token, String username) {
        try {
            return extractUsername(token).equals(username) && !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaims(token).getExpiration();
    }

    public Claims extractClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("🚨 El token ha expirado.");
        } catch (JwtException e) {
            throw new RuntimeException("🚨 Token inválido.");
        }
    }
}
