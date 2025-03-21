package com.comparathor.controller;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ForbiddenException;
import com.comparathor.service.UserSecurityService;
import com.comparathor.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserSecurityService userSecurityService;

    @GetMapping
    public Map<String, Object> getUsersFiltered(
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "roleId", required = false) Long roleId,
            @RequestParam(name = "searchTerm", required = false) String searchTerm,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortField", required = false) String sortField,
            @RequestParam(name = "sortOrder", required = false) String sortOrder) {
        validateAccess(token);
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : null;
        return userService.getFilteredUsers(search,roleId, searchTerm, startDateTime, endDateTime, page, size, sortField, sortOrder);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@RequestHeader("Authorization") String token,
                                                          @RequestBody Map<String, String> request) {
        validateAccess(token);
        if (!request.containsKey("name") || !request.containsKey("email") || !request.containsKey("password")) {
            throw new BadRequestException("Se requiere name, email y password.");
        }
        Long roleId = request.containsKey("roleId") ? Long.parseLong(request.get("roleId")) : 2L;
        Map<String, Object> response = userService.registerUser(
                request.get("name"),
                request.get("email"),
                request.get("password"),
                roleId
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> editUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        validateAccess(token);
        if (!request.containsKey("name") && !request.containsKey("email") && !request.containsKey("roleId")) {
            throw new BadRequestException("❌ Se requiere al menos un campo para actualizar.");
        }
        String name = request.get("name");
        String email = request.get("email");
        Long roleId = request.containsKey("roleId") ? Long.parseLong(request.get("roleId")) : null;
        Map<String, Object> response = userService.editUser(userId, name, email, roleId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId) {
        validateAccess(token);
        userService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "✅ Usuario eliminado con éxito."));
    }

    @PatchMapping("/{userId}/password")
    public ResponseEntity<Map<String, Object>> updateUserPassword(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        validateAccess(token);
        if (!request.containsKey("password")) {
            throw new BadRequestException("❌ Se requiere la nueva contraseña.");
        }
        String newPassword = request.get("password");
        Map<String, Object> response = userService.updateUserPassword(userId, newPassword);
        return ResponseEntity.ok(response);
    }

    private void validateAccess(String token) {
        if (!userSecurityService.hasRole(token, "ROLE_ADMIN")) {
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere el rol: " + "ROLE_ADMIN");
        }
    }
}
