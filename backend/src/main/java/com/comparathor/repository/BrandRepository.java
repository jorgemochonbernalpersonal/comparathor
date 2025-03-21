package com.comparathor.repository;

import com.comparathor.model.Brand;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface BrandRepository {
    Brand save(Brand brand);

    List<Brand> findAll();

    Optional<Brand> findById(@Param("id") Long id);

    boolean existsByName(@Param("name") String name);

    boolean existsById(@Param("id") Long id);

    void delete(@Param("id") Long id);

    Long findIdByName(@Param("name") String name);

    List<Brand> findFilteredBrands(
            @Param("reliability") Integer reliability,
            @Param("isActive") Boolean isActive,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("size") int size,
            @Param("offset") int offset,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder
    );

    int countFilteredBrands(
            @Param("reliability") Integer reliability,
            @Param("isActive") Boolean isActive,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
