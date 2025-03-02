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
        token = token.substring(7);
        List<String> roles = jwtUtil.extractRoles(token);
        return roles != null && roles.contains(role);
    }

    public boolean isCurrentUser(HttpServletRequest request, Long userId) {
        Object userIdAttr = request.getAttribute("userId");

        if (userIdAttr instanceof Long) {
            return ((Long) userIdAttr).equals(userId);
        }
        return false;
    }
}
