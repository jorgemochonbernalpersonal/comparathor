package com.comparathor.repository;

import com.comparathor.model.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ProductRepository {
    Product findById(@Param("id") Long id);

    List<Product> findFilteredProducts(
            @Param("search") String search,
            @Param("name") String name,
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minStock") Integer minStock,
            @Param("maxStock") Integer maxStock,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("size") int size,
            @Param("offset") int offset,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder
    );

    int countFilteredProducts(
            @Param("search") String search,
            @Param("name") String name,
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minStock") Integer minStock,
            @Param("maxStock") Integer maxStock,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    void save(Product product);

    boolean existsByName(@Param("name") String name);

    void deleteById(@Param("id") Long id);

    void saveAll(@Param("products") List<Product> products);

    void updateAll(@Param("products") List<Product> products);

    Optional<Product> findByImageUrl(@Param("imageUrl") String imageUrl);
}
