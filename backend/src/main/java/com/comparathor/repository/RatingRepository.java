package com.comparathor.repository;

import com.comparathor.model.Rating;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface RatingRepository {
    void save(Rating rating);

    Rating findById(@Param("id") Long id);

    List<Rating> findByProductId(@Param("productId") Long productId);

    int existsById(@Param("id") Long id);

    void deleteById(@Param("id") Long id);

    void updateRating(@Param("id") Long id,
                      @Param("rating") Double rating,
                      @Param("comment") String comment,
                      @Param("updatedAt") LocalDateTime updatedAt);

    List<Rating> findFilteredRatings(@Param("productId") Long productId,
                                     @Param("userId") Long userId,
                                     @Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate,
                                     @Param("size") int size,
                                     @Param("offset") int offset,
                                     @Param("sortField") String sortField,
                                     @Param("sortOrder") String sortOrder);

    int countFilteredRatings(@Param("productId") Long productId,
                             @Param("userId") Long userId,
                             @Param("startDate") LocalDateTime startDate,
                             @Param("endDate") LocalDateTime endDate);

    List<Rating> findUserRatingForProduct(@Param("productId") Long productId, @Param("userId") Long userId);

}
