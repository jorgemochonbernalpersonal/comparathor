package com.comparathor.repository;

import com.comparathor.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface UserRepository {
    User findById(@Param("id") Long id);

    User findByEmail(@Param("email") String email);

    int existsByEmail(@Param("email") String email);

    void save(User user);

    List<User> findFilteredUsers(
            @Param("roleName") String roleName,
            @Param("searchTerm") String searchTerm,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("offset") int offset,
            @Param("size") int size
    );

    int countFilteredUsers(
            @Param("roleName") String roleName,
            @Param("searchTerm") String searchTerm,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
