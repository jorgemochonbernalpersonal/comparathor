package com.comparathor.repository;

import com.comparathor.model.Role;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface RoleRepository {
    List<Role> findFilteredRoles(
            @Param("roleName") String roleName,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("roleCreatedBy") String roleCreatedBy,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder,
            @Param("searchTerm") String searchTerm
    );
    int countFilteredRoles(
            @Param("roleName") String roleName,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("roleCreatedBy") String roleCreatedBy,
            @Param("searchTerm") String searchTerm
    );
    Optional<Role> findById(@Param("id") Long id);
    int existsById(@Param("id") Long id);
    int existsByName(@Param("name") String name);
    void save(Role role);
    void updateRole(
            @Param("id") Long id,
            @Param("name") String name,
            @Param("description") String description,
            @Param("updatedAt") LocalDateTime updatedAt,
            @Param("roleCreatedBy") String roleCreatedBy
    );
    void deleteById(@Param("id") Long id);
}
