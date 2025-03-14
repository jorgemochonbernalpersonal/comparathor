package com.comparathor.service;

import com.comparathor.config.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserSecurityService {

    private final JwtUtil jwtUtil;

    public UserSecurityService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public boolean hasRole(String token, String role) {
        if (token == null || !token.startsWith("Bearer ")) {
            return false;
        }

        try {
            token = token.substring(7);
            List<String> roles = jwtUtil.extractRoles(token);
            return roles != null && roles.contains(role);
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new IllegalArgumentException("🚫 Token inválido o no proporcionado.");
        }
        try {
            token = token.substring(7); // Eliminar "Bearer " del token
            return jwtUtil.extractUsername(token);
        } catch (Exception e) {
            throw new IllegalArgumentException("🚫 No se pudo extraer el nombre de usuario del token.");
        }
    }

    public boolean hasAnyRole(String token, String... roles) {
        if (token == null || !token.startsWith("Bearer ")) {
            return false;
        }
        try {
            token = token.substring(7);
            List<String> userRoles = jwtUtil.extractRoles(token);
            if (userRoles == null) {
                return false;
            }
            for (String role : roles) {
                if (userRoles.contains(role)) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isCurrentUser(HttpServletRequest request, Long userId) {
        Object userIdAttr = request.getAttribute("userId");

        if (userIdAttr instanceof Long userIdLong) {
            return userIdLong.equals(userId);
        }
        return false;
    }
}
