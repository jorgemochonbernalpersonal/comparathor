package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Rating;
import com.comparathor.repository.RatingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RatingService {
    private final RatingRepository ratingRepository;

    public RatingService(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    @Transactional
    public Rating createRating(Rating rating) {
        if (rating.getRating() < 1 || rating.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        ratingRepository.insertRating(rating);
        return rating;
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
    public List<Rating> getRatingsByProductId(Long productId) {
        return ratingRepository.findByProductId(productId);
    }

    @Transactional(readOnly = true)
    public List<Rating> getAllRatings() {
        return ratingRepository.findAllRatings();
    }

    @Transactional
    public Rating updateRating(Long id, Rating updatedRating) {
        Rating existingRating = ratingRepository.findById(id);
        if (existingRating == null) {
            throw new ResourceNotFoundException("Rating not found with ID: " + id);
        }

        if (updatedRating.getRating() < 1 || updatedRating.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        existingRating.setRating(updatedRating.getRating());
        existingRating.setComment(updatedRating.getComment());

        ratingRepository.updateRating(existingRating);
        return existingRating;
    }

    @Transactional
    public void deleteRating(Long id) {
        if (ratingRepository.existsById(id) == 0) {
            throw new ResourceNotFoundException("Rating not found with ID: " + id);
        }
        ratingRepository.deleteRating(id);
    }
}
