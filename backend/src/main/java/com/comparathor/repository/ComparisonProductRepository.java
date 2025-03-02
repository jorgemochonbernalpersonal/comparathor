package com.comparathor.repository;

import com.comparathor.model.ComparisonProduct;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ComparisonProductRepository {
    void insertComparisonProduct(ComparisonProduct comparisonProduct);
    void insertMultipleComparisonProducts(@Param("comparisonId") Long comparisonId, @Param("productIds") List<Long> productIds);
    ComparisonProduct findById(@Param("id") Long id);
    List<ComparisonProduct> findAllComparisonProducts();
    List<ComparisonProduct> findComparisonProductsByComparisonId(@Param("comparisonId") Long comparisonId);
    int existsById(@Param("id") Long id);
    void deleteComparisonProduct(@Param("id") Long id);
    void deleteByComparisonId(@Param("comparisonId") Long comparisonId);
    List<Long> findProductIdsByComparisonId(@Param("comparisonId") Long comparisonId);
}
