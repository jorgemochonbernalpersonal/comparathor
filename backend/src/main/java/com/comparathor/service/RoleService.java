package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Role;
import com.comparathor.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class RoleService {
    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("❌ Role not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFilteredRoles(
            String roleName, LocalDateTime startDate, LocalDateTime endDate,
            String roleCreatedBy, String sortField, String sortOrder, String searchTerm) {

        List<Role> roles = roleRepository.findFilteredRoles(roleName, startDate, endDate, roleCreatedBy, sortField, sortOrder, searchTerm);
        int total = roleRepository.countFilteredRoles(roleName, startDate, endDate, roleCreatedBy, searchTerm);

        Map<String, Object> response = new HashMap<>();
        response.put("content", roles);
        response.put("totalElements", total);
        return response;
    }

    @Transactional
    public Map<String, Object> registerRole(String name, String description, String roleCreatedBy) {
        if (roleRepository.existsByName(name) > 0) {
            throw new BadRequestException("🚫 Role already exists: " + name);
        }
        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        LocalDateTime now = LocalDateTime.now();
        role.setCreatedAt(now);
        role.setUpdatedAt(now);
        role.setRoleCreatedBy(roleCreatedBy);
        roleRepository.save(role);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Role registrado con éxito.");
        response.put("role", role);
        return response;
    }

    @Transactional
    public Map<String, Object> editRole(Long roleId, String name, String description, String roleCreatedBy) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new BadRequestException("El rol con ID " + roleId + " no existe."));
        if (name != null && !name.equalsIgnoreCase(role.getName()) && roleRepository.existsByName(name) > 0) {
            throw new BadRequestException("El nombre de rol '" + name + "' ya está en uso.");
        }
        role.setName(name != null ? name : role.getName());
        role.setDescription(description != null ? description : role.getDescription());
        role.setUpdatedAt(LocalDateTime.now());
        role.setRoleCreatedBy(roleCreatedBy);
        System.out.println(String.format(
                "ID: %d, Name: %s, Description: %s, UpdatedAt: %s, RoleCreatedBy: %s",
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getUpdatedAt(),
                role.getRoleCreatedBy()
        ));
        roleRepository.updateRole(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getUpdatedAt(),
                role.getRoleCreatedBy()
        );
        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Rol actualizado con éxito.");
        return response;
    }

    @Transactional
    public void deleteRole(Long id) {
        if (roleRepository.existsById(id) == 0) {
            throw new ResourceNotFoundException("Role not found with ID: " + id);
        }
        logger.info("🗑️ Eliminando rol con ID {}", id);
        roleRepository.deleteById(id);
    }
}
