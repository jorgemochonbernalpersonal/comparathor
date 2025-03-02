package com.comparathor.controller;

import com.comparathor.exception.ForbiddenException;
import com.comparathor.model.Role;
import com.comparathor.service.RoleService;
import com.comparathor.service.UserSecurityService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);

    @PostMapping
    public ResponseEntity<Role> createRole(@RequestHeader("Authorization") String token, @RequestBody Role role) {
        validateAccess(token, "ROLE_ADMIN");

        Role createdRole = roleService.createRole(role);
        logger.info("✅ Role created: {}", createdRole.getName());
        return ResponseEntity.ok(createdRole);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        validateAccess(token, "ROLE_ADMIN");

        Role role = roleService.getRoleById(id);
        logger.info("✅ Role retrieved with ID: {}", id);
        return ResponseEntity.ok(role);
    }

    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles(
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "names", required = false) String names) {

        validateAccess(token, "ROLE_ADMIN");

        List<Role> roles;
        if (names != null && !names.isEmpty()) {
            List<String> roleNames = Arrays.asList(names.split(","));
            roles = roleService.getRolesByNames(roleNames);
            logger.info("✅ Retrieved filtered roles: {}", roleNames);
        } else {
            roles = roleService.getAllRoles();
            logger.info("✅ Retrieved all roles");
        }

        return ResponseEntity.ok(roles);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRole(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        validateAccess(token, "ROLE_ADMIN");

        roleService.deleteRole(id);
        logger.info("✅ Role deleted with ID: {}", id);
        return ResponseEntity.ok("✅ Role successfully deleted.");
    }

    private void validateAccess(String token, String requiredRole) {
        if (!userSecurityService.hasRole(token, requiredRole)) {
            throw new ForbiddenException("🚫 Access denied. Required role: " + requiredRole);
        }
    }
}
