package com.comparathor.repository;

import com.comparathor.model.Product;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ProductRepository {
    void insertProduct(Product product);
    void updateProduct(Product product);
    Product findById(@Param("id") Long id);
    List<Product> findFilteredProducts(
            @Param("name") String name,
            @Param("category") String category,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("stock") Integer stock,
            @Param("brand") String brand,
            @Param("model") String model,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("offset") int offset,
            @Param("size") int size
    );

    int countFilteredProducts(
            @Param("name") String name,
            @Param("category") String category,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("stock") Integer stock,
            @Param("brand") String brand,
            @Param("model") String model,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    List<Product> findByCategory(@Param("category") String category);
    int existsById(@Param("id") Long id);
    int existsByName(@Param("name") String name);
    void deleteProduct(@Param("id") Long id);
}
