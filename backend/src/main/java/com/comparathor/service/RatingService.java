package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Rating;
import com.comparathor.repository.RatingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RatingService {
    private static final Logger logger = LoggerFactory.getLogger(RatingService.class);
    private final RatingRepository ratingRepository;

    public RatingService(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    @Transactional(readOnly = true)
    public Rating getRatingById(Long id) {
        Rating rating = ratingRepository.findById(id);
        if (rating == null) {
            throw new ResourceNotFoundException("Rating not found with ID: " + id);
        }
        return rating;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFilteredRatings(Long productId, Long userId,
                                                  Double minRating,
                                                  LocalDateTime startDate, LocalDateTime endDate,
                                                  int page, int size, String sortField, String sortOrder) {
        size = Math.max(size, 10);
        int totalRatings = ratingRepository.countFilteredRatings(productId, userId, minRating, startDate, endDate);
        if (totalRatings == 0) {
            logger.warn("No se encontraron ratings con los filtros proporcionados.");
            return Map.of(
                    "content", List.of(),
                    "total", 0,
                    "page", 1,
                    "size", size
            );
        }
        int totalPages = (int) Math.ceil((double) totalRatings / size);
        page = Math.max(1, Math.min(page, totalPages)) - 1;
        int offset = Math.min(page * size, totalRatings - size);
        offset = Math.max(offset, 0);
        List<Rating> ratings = ratingRepository.findFilteredRatings(productId, userId, minRating, startDate, endDate, size, offset, sortField, sortOrder);
        return Map.of(
                "content", ratings,
                "total", totalRatings,
                "page", page + 1,
                "size", size
        );
    }

    @Transactional
    public Map<String, Object> registerRating(Long userId, Long productId, Double rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        Rating newRating = new Rating();
        newRating.setUserId(userId);
        newRating.setProductId(productId);
        newRating.setRating(rating);
        newRating.setComment(comment);
        LocalDateTime now = LocalDateTime.now();
        newRating.setCreatedAt(now);
        newRating.setUpdatedAt(now);
        ratingRepository.save(newRating);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Rating registrado con éxito.");
        response.put("rating", newRating);
        return response;
    }

    @Transactional
    public Map<String, Object> editRating(Long ratingId, Double rating, String comment) {
        Rating existingRating = ratingRepository.findById(ratingId);
        if (existingRating == null) {
            throw new ResourceNotFoundException("Rating not found with ID: " + ratingId);
        }

        if (rating != null && (rating < 1 || rating > 5)) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        existingRating.setRating(rating != null ? rating : existingRating.getRating());
        existingRating.setComment(comment != null ? comment : existingRating.getComment());
        existingRating.setUpdatedAt(LocalDateTime.now());

        ratingRepository.updateRating(existingRating.getId(), existingRating.getRating(), existingRating.getComment(), existingRating.getUpdatedAt());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Rating actualizado con éxito.");
        return response;
    }

    @Transactional
    public void deleteRating(Long id) {
        if (ratingRepository.existsById(id) == 0) {
            throw new ResourceNotFoundException("Rating not found with ID: " + id);
        }
        logger.info("Eliminando calificación con ID {}", id);
        ratingRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Rating> getRatingsByProductId(Long productId) {
        List<Rating> ratings = ratingRepository.findByProductId(productId);
        if (ratings.isEmpty()) {
            throw new ResourceNotFoundException("No ratings found for product ID: " + productId);
        }
        logger.info("Retrieved {} ratings for product ID: {}", ratings.size(), productId);
        return ratings;
    }

    @Transactional(readOnly = true)
    public Rating getUserRatingForProduct(Long productId, Long userId) {
        logger.info("🔎 Buscando rating para el producto ID: {} y usuario ID: {}", productId, userId);

        List<Rating> ratings = ratingRepository.findUserRatingForProduct(productId, userId);
    System.out.println("coc " + ratings);
        if (ratings.isEmpty()) {
            logger.warn("⚠️ No se encontró un rating en la base de datos para el producto ID: {} y usuario ID: {}", productId, userId);
            return null;
        }

        Rating rating = ratings.getFirst();
        logger.info("✅ Se encontró un rating: {} estrellas, comentario: '{}'", rating.getRating(), rating.getComment());

        return rating;
    }

}
