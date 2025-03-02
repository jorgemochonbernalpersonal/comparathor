package com.comparathor.repository;

import com.comparathor.model.Rating;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface RatingRepository {
    void insertRating(Rating rating);
    Rating findById(@Param("id") Long id);
    List<Rating> findAllRatings();
    List<Rating> findByProductId(@Param("productId") Long productId);
    int existsById(@Param("id") Long id);
    void updateRating(Rating rating);
    void deleteRating(@Param("id") Long id);
}
