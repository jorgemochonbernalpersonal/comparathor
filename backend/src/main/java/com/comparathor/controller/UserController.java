package com.comparathor.controller;

import com.comparathor.exception.ForbiddenException;
import com.comparathor.model.User;
import com.comparathor.service.UserService;
import com.comparathor.service.UserSecurityService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final UserSecurityService userSecurityService;

    public UserController(UserService userService, UserSecurityService userSecurityService) {
        this.userService = userService;
        this.userSecurityService = userSecurityService;
    }

    @GetMapping
    public Map<String, Object> getUsersFiltered(
            @RequestParam(name = "roleName", required = false) String roleName,
            @RequestParam(name = "searchTerm", required = false) String searchTerm,
            @RequestParam(name = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        System.out.println("🔍 Filtrando usuarios...");
        System.out.println("📌 Role: " + (roleName != null ? roleName : "No filtrado"));
        System.out.println("🔎 Search: " + (searchTerm != null ? searchTerm : "No filtrado"));
        System.out.println("📅 Fecha inicio: " + (startDate != null ? startDate : "No filtrado"));
        System.out.println("📅 Fecha fin: " + (endDate != null ? endDate : "No filtrado"));
        System.out.println("📄 Página: " + page + " | Tamaño: " + size);

        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : null;

        return userService.getFilteredUsers(roleName, searchTerm, startDateTime, endDateTime, page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(HttpServletRequest request, @PathVariable Long id) {
        String token = request.getHeader("Authorization");
        validateAccess(request, token, id);
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    private void validateAccess(HttpServletRequest request, String token, Long userId) {
        if (!userSecurityService.hasRole(token, "ROLE_ADMIN") && !userSecurityService.isCurrentUser(request, userId)) {
            throw new ForbiddenException("🚫 Access denied. You do not have permission to view this user.");
        }
    }
}
