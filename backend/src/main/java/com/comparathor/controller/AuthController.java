package com.comparathor.controller;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ForbiddenException;
import com.comparathor.service.AuthService;
import com.comparathor.service.UserSecurityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    public AuthController(AuthService authService, UserSecurityService userSecurityService) {
        this.authService = authService;
        this.userSecurityService = userSecurityService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        if (!loginRequest.containsKey("email") || !loginRequest.containsKey("password")) {
            throw new BadRequestException("❌ Se requiere email y password.");
        }
        Map<String, Object> response = authService.loginUserAndAuthenticate(
                loginRequest.get("email"),
                loginRequest.get("password")
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> request) {
        if (!request.containsKey("refresh_token")) {
            throw new BadRequestException("❌ Debes proporcionar un refresh token.");
        }
        authService.logout(request.get("refresh_token"));
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout exitoso");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        if (!request.containsKey("name") || !request.containsKey("email") || !request.containsKey("password")) {
            throw new BadRequestException("❌ Se requiere name, email y password.");
        }
        Long roleId = request.containsKey("roleId") ? Long.parseLong(request.get("roleId")) : 2L;
        Map<String, Object> response = authService.registerUserAndAuthenticate(
                request.get("name"),
                request.get("email"),
                request.get("password"),
                roleId
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> refreshRequest) {
        if (!refreshRequest.containsKey("refresh_token")) {
            throw new BadRequestException("⚠️ Refresh token no proporcionado");
        }

        Map<String, Object> response = authService.refreshToken(refreshRequest.get("refresh_token"));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin")
    public ResponseEntity<String> adminEndpoint(@RequestHeader("Authorization") String token) {
        if (!userSecurityService.hasRole(token, "ROLE_ADMIN")) {
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere rol de ADMIN.");
        }
        return ResponseEntity.ok("🛡️ Acceso autorizado a ADMIN");
    }
}
