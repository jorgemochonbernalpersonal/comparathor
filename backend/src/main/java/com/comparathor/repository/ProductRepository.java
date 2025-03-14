package com.comparathor.repository;

import com.comparathor.model.Product;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ProductRepository {
    Product findById(@Param("id") Long id);
    List<Product> findFilteredProducts(
            @Param("name") String name,
            @Param("category") String category,
            @Param("brand") String brand,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("stock") Integer stock,
            @Param("searchTerm") String searchTerm,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("size") int size,
            @Param("offset") int offset,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder
    );
    int countFilteredProducts(
            @Param("name") String name,
            @Param("category") String category,
            @Param("brand") String brand,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("stock") Integer stock,
            @Param("searchTerm") String searchTerm,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    void save(Product product);
    int existsById(@Param("id") Long id);
    int existsByName(@Param("name") String name);
    void delete(@Param("id") Long id);
}

