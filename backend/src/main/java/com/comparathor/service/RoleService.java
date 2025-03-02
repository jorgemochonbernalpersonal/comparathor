package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Role;
import com.comparathor.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoleService {
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
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Role> getRolesByNames(List<String> names) {
        return roleRepository.findByNames(names);
    }

    @Transactional
    public Role createRole(Role role) {
        if (roleRepository.existsByName(role.getName())) {
            throw new BadRequestException("🚫 Role already exists: " + role.getName());
        }
        roleRepository.save(role);
        return role;
    }

    @Transactional
    public void deleteRole(Long id) {
        if (roleRepository.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("❌ Role not found with ID: " + id);
        }
        roleRepository.deleteById(id);
    }
}
