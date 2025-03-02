package com.comparathor.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
    private final JwtUtil jwtUtil;

    public JwtRequestFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        String token = request.getHeader("Authorization");

        logger.info("📢 Petición recibida: [{}] {}", method, requestURI);

        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Expose-Headers", "Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        if ("OPTIONS".equalsIgnoreCase(method)) {
            logger.info("🟢 OPTIONS request detectado, permitiendo sin verificación.");
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        List<String> publicRoutes = List.of(
                "/api/auth/register",
                "/api/auth/login"
        );

        if (publicRoutes.stream().anyMatch(route -> requestURI.equalsIgnoreCase(route))) {
            logger.info("🟢 Ruta pública detectada: {}, permitiendo acceso sin token.", requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        if (token == null || !token.startsWith("Bearer ")) {
            logger.warn("🚨 Token no proporcionado o mal formado para la ruta: {}", requestURI);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token no proporcionado");
            return;
        }

        token = token.substring(7);

        try {
            String username = jwtUtil.extractUsername(token);
            List<String> roles = jwtUtil.extractRoles(token);

            if (username == null || roles == null || roles.isEmpty() || !jwtUtil.validateToken(token, username)) {
                logger.warn("❌ Token inválido o expirado para el usuario: {}", username);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token inválido o expirado");
                return;
            }

            logger.info("✅ Token válido para el usuario: {}", username);
            request.setAttribute("username", username);
            request.setAttribute("roles", roles);
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            logger.error("❌ Error en la validación del token: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token inválido o expirado");
        }
    }
}
