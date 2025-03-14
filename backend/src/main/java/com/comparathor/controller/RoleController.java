package com.comparathor.controller;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ForbiddenException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Role;
import com.comparathor.service.RoleService;
import com.comparathor.service.UserSecurityService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);

    @PostMapping
    public ResponseEntity<Map<String, Object>> createRole(@RequestHeader("Authorization") String token,
                                                          @RequestBody Map<String, String> request) {
        validateAccess(token);
        if (!request.containsKey("name") || !request.containsKey("description")) {
            throw new BadRequestException("Se requieren 'name' y 'description'.");
        }
        String roleCreatedByFromToken = userSecurityService.getUsernameFromToken(token);
        String roleCreatedByFromRequest = request.get("roleCreatedBy");
        if (roleCreatedByFromRequest != null && !roleCreatedByFromRequest.equals(roleCreatedByFromToken)) {
            throw new BadRequestException("El usuario no es el admin.");
        }
        Map<String, Object> response = roleService.registerRole(
                request.get("name"),
                request.get("description"),
                roleCreatedByFromToken
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoleById(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        validateAccess(token);
        try {
            Role role = roleService.getRoleById(id);
            return ResponseEntity.ok(role);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    @GetMapping
    public ResponseEntity<Map<String, Object>> getFilteredRoles(
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "roleName", required = false) String roleName,
            @RequestParam(name = "searchTerm", required = false) String searchTerm,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "roleCreatedBy", required = false) String roleCreatedBy,
            @RequestParam(name = "sortField", required = false) String sortField,
            @RequestParam(name = "sortOrder", required = false) String sortOrder
    ) {
        validateAccess(token);
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : null;
        try {
            Map<String, Object> response = roleService.getFilteredRoles(roleName, startDateTime, endDateTime, roleCreatedBy, sortField, sortOrder, searchTerm);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("❌ Error al obtener roles: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error al obtener roles"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRole(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String roleCreatedByFromToken = userSecurityService.getUsernameFromToken(token);
        validateAccess(token);
        if (!request.containsKey("name") && !request.containsKey("description")) {
            throw new BadRequestException("❌ Se requiere al menos un campo para actualizar.");
        }
        String name = request.get("name");
        String description = request.get("description");
        Map<String, Object> response = roleService.editRole(id, name, description,roleCreatedByFromToken);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRole(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        validateAccess(token);
        try {
            roleService.deleteRole(id);
            logger.info("✅ Role deleted with ID: {}", id);
            return ResponseEntity.ok(Collections.singletonMap("message", "✅ Role successfully deleted."));
        } catch (ResourceNotFoundException e) {
            logger.warn("❌ Error al eliminar, rol no encontrado (ID: {}): {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Error inesperado al eliminar rol (ID: {}): {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", "Error interno al eliminar el rol."));
        }
    }

    private void validateAccess(String token) {
        if (!userSecurityService.hasRole(token, "ROLE_ADMIN")) {
            logger.warn("🚫 Acceso denegado. Usuario sin ROLE_ADMIN.");
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere el rol: ROLE_ADMIN");
        }
    }
}
