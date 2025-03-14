package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.model.Role;
import com.comparathor.model.User;
import com.comparathor.repository.RoleRepository;
import com.comparathor.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private  final  EmailService emailService;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.emailService = emailService;
    }

    public Map<String, Object> getFilteredUsers(Long roleId, String searchTerm,
                                                LocalDateTime startDate, LocalDateTime endDate,
                                                int page, int size, String sortField, String sortOrder) {
        size = (size <= 0) ? 10 : size;
        int totalUsers = userRepository.countFilteredUsers(roleId, searchTerm, startDate, endDate);
        int offset = (page * size >= totalUsers) ? Math.max(0, totalUsers - size) : page * size;
        System.out.println("✅ Total usuarios: " + totalUsers);
        System.out.println("✅ Offset corregido: " + offset);
        List<User> users = userRepository.findFilteredUsers(roleId, searchTerm, startDate, endDate, size, offset, sortField, sortOrder);
        System.out.println("📌 Usuarios encontrados: " + users.size());
        Map<String, Object> response = new HashMap<>();
        response.put("content", users);
        response.put("total", totalUsers);
        response.put("page", page);
        response.put("size", size);
        return response;
    }

    @Transactional
    public Map<String, Object> registerUser(String username, String email, String password, Long roleId) {
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
        Optional<Role> optionalRole = roleRepository.findById(roleId);

        if (optionalRole.isEmpty()) {
            throw new RuntimeException("❌ Error: El rol con ID '" + roleId + "' no existe en la base de datos.");
        }
        Role role = optionalRole.get();
        user.setRole(role);
        user.setRoleId(role.getId());

        userRepository.save(user);
        emailService.sendUserCreationEmail(email, password);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Usuario registrado con éxito.");
        return response;
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw new BadRequestException("El usuario con ID " + userId + " no existe.");
        }
        userRepository.delete(userId);
    }

    @Transactional
    public Map<String, Object> editUser(Long userId, String username, String email, Long roleId) {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw new BadRequestException("El usuario con ID " + userId + " no existe.");
        }

        if (email != null && !email.equals(user.getEmail()) && userRepository.findByEmail(email) != null) {
            throw new BadRequestException("El email " + email + " ya está en uso.");
        }

        user.setName(username != null ? username : user.getName());
        user.setEmail(email != null ? email : user.getEmail());

        if (roleId != null) {
            Optional<Role> optionalRole = roleRepository.findById(roleId);
            if (optionalRole.isEmpty()) {
                throw new BadRequestException("El rol con ID " + roleId + " no existe.");
            }
            user.setRole(optionalRole.get());
            user.setRoleId(roleId);
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.update(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Usuario actualizado con éxito.");
        return response;
    }

    @Transactional
    public Map<String, Object> updateUserPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw new BadRequestException("El usuario con ID " + userId + " no existe.");
        }

        user.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.update(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Contraseña actualizada con éxito.");
        return response;
    }

}
