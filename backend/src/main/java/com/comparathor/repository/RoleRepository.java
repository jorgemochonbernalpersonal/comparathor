package com.comparathor.repository;

import com.comparathor.model.Role;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Optional;

@Mapper
public interface RoleRepository {
    List<Role> findAll();
    List<Role> findByNames(@Param("names") List<String> names);
    Optional<Role> findById(@Param("id") Long id);
    Optional<Role> findByName(@Param("name") String name);
    boolean existsByName(@Param("name") String name);
    void save(Role role);
    void deleteById(@Param("id") Long id);
}
