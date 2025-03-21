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
    void save(User user);
    void update(User user);
    void delete(@Param("id") Long id);
    List<User> findFilteredUsers(
            @Param("search") String search,
            @Param("roleId") Long roleId,
            @Param("searchTerm") String searchTerm,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("size") int size,
            @Param("offset") int offset,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder
    );

    int countFilteredUsers(
            @Param("search") String search,
            @Param("roleId") Long roleId,
            @Param("searchTerm") String searchTerm,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
