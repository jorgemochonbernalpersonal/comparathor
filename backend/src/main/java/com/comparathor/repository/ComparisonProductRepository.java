package com.comparathor.repository;

import com.comparathor.model.ComparisonProduct;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;


@Mapper
public interface ComparisonProductRepository {
    void insertMultipleComparisonProducts(@Param("comparisonId") Long comparisonId, @Param("productIds") List<Long> productIds);
    ComparisonProduct findById(@Param("id") Long id);
    void deleteByComparisonId(@Param("comparisonId") Long comparisonId);
    List<Long> findProductIdsByComparisonId(@Param("comparisonId") Long comparisonId);
    List<Map<String, Object>> findProductsByComparisonId(@Param("comparisonId") Long comparisonId);
}
