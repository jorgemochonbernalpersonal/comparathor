package com.comparathor.repository;

import com.comparathor.model.ComparisonProduct;
import com.comparathor.model.Product;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ComparisonProductRepository {
    void insertMultipleComparisonProducts(@Param("comparisonId") Long comparisonId, @Param("productIds") List<Long> productIds);
    ComparisonProduct findById(@Param("id") Long id);
    void deleteByComparisonId(@Param("comparisonId") Long comparisonId);
    List<Long> findProductIdsByComparisonId(@Param("comparisonId") Long comparisonId);
    List<Product> findProductsByComparisonId(@Param("comparisonId") Long comparisonId);
}
