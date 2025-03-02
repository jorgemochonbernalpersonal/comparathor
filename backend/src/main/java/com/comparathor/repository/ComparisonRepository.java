package com.comparathor.repository;

import com.comparathor.model.Comparison;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ComparisonRepository {
    void insertComparison(Comparison comparison);
    Comparison findComparisonById(@Param("id") Long id);
    List<Comparison> findAllComparisons();
    List<Comparison> findComparisonsByUserId(@Param("userId") Long userId);
    int existsById(@Param("id") Long id);
    boolean existsByDescriptionAndUserId(@Param("description") String description, @Param("userId") Long userId);
    void deleteComparison(@Param("id") Long id);
}
