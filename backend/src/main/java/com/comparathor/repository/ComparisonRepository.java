package com.comparathor.repository;

import com.comparathor.model.Comparison;
import org.apache.ibatis.annotations.*;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ComparisonRepository {

    Comparison findById(@Param("id") Long id);

    void save(Comparison comparison);

    void updateComparison(
            @Param("id") Long id,
            @Param("title") String title,
            @Param("description") String description,
            @Param("productIds") List<Long> productIds,
            @Param("updatedAt") LocalDateTime updatedAt
    );

    void deleteById(@Param("id") Long id);

    List<Comparison> findByUserId(@Param("userId") Long userId);

    List<Comparison> findFilteredComparisons(
            @Param("userId") Long userId,
            @Param("title") String title,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("name") String name,
            @Param("category") String category,
            @Param("price") Double price,
            @Param("stock") Integer stock,
            @Param("brand") String brand,
            @Param("model") String model,
            @Param("comparisonIds") List<Long> comparisonIds,
            @Param("size") int size,
            @Param("offset") int offset,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder
    );

    int countFilteredComparisons(
            @Param("userId") Long userId,
            @Param("title") String title,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("name") String name,
            @Param("category") String category,
            @Param("price") Double price,
            @Param("stock") Integer stock,
            @Param("brand") String brand,
            @Param("model") String model,
            @Param("comparisonIds") List<Long> comparisonIds // 🔥 AÑADIDO AQUÍ
    );

    int existsById(@Param("id") Long id);
}
