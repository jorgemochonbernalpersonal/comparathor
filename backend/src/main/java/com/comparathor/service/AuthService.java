package com.comparathor.service;

import com.comparathor.config.JwtUtil;
import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.UnauthorizedException;
import com.comparathor.model.Role;
import com.comparathor.model.User;
import com.comparathor.repository.RoleRepository;
import com.comparathor.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private final Map<Long, String> userRefreshTokens = new ConcurrentHashMap<>();
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public AuthService(JwtUtil jwtUtil, UserRepository userRepository, RoleRepository roleRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> refreshToken(String refreshToken) {
        Long userId = userRefreshTokens.entrySet().stream()
                .filter(entry -> entry.getValue().equals(refreshToken))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(null);

        if (userId == null) {
            throw new UnauthorizedException("No se encontró un usuario con el refreshToken proporcionado.");
        }

        User user = userRepository.findById(userId);
        if (user == null) {
            throw new UnauthorizedException("Usuario no encontrado para el refresh token.");
        }

        String newAccessToken = generateAccessToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", newAccessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", user);
        return response;
    }

    public String generateAccessToken(User user) {
        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().getName());
    }

    public String generateRefreshToken(User user) {
        String newRefreshToken = UUID.randomUUID().toString();
        userRefreshTokens.put(user.getId(), newRefreshToken);
        return newRefreshToken;
    }

    @Transactional
    public void logout(String refreshToken) {
        if (!userRefreshTokens.containsValue(refreshToken)) {
            throw new UnauthorizedException("❌ Refresh token no válido o expirado.");
        }
        Long userId = userRefreshTokens.entrySet().stream()
                .filter(entry -> entry.getValue().equals(refreshToken))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(null);
        if (userId != null) {
            userRefreshTokens.remove(userId);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> loginUserAndAuthenticate(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null || !BCrypt.checkpw(password, user.getPassword())) {
            throw new BadRequestException("❌ Credenciales incorrectas");
        }
        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);
        userRefreshTokens.put(user.getId(), refreshToken);
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", user);
        return response;
    }

    @Transactional
    public Map<String, Object> registerUserAndAuthenticate(String username, String email, String password, Long roleId) {
        if (userRepository.findByEmail(email) != null) {
            throw new BadRequestException("El usuario con el email " + email + " ya está registrado.");
        }
        User user = new User();
        user.setName(username);
        user.setEmail(email);
        user.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        roleId = (roleId != null) ? roleId : 2L;
        Optional<Role> optionalRole = roleRepository.findById(2L);
        if (optionalRole.isEmpty()) {
            throw new RuntimeException("❌ Error: El rol con ID '" + roleId + "' no existe en la base de datos.");
        }
        Role role = optionalRole.get();
        user.setRole(role);
        user.setRoleId(role.getId());
        userRepository.save(user);
        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);
        userRefreshTokens.put(user.getId(), refreshToken);
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", user);
        return response;
    }
}
