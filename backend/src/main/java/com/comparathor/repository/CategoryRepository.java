package com.comparathor.repository;

import com.comparathor.model.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface CategoryRepository {
    Category save(Category category);

    List<Category> findAll();

    Optional<Category> findById(@Param("id") Long id);

    boolean existsByName(@Param("name") String name);

    boolean existsById(@Param("id") Long id);

    void delete(@Param("id") Long id);

    Long findIdByName(@Param("name") String name);

    List<Category> findFilteredCategories(
            @Param("color") String color,
            @Param("isActive") Boolean isActive,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("size") int size,
            @Param("offset") int offset,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder
    );

    int countFilteredCategories(
            @Param("color") String color,
            @Param("isActive") Boolean isActive,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
