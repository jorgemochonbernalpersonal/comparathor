package com.comparathor.controller;

import com.comparathor.exception.ForbiddenException;
import com.comparathor.model.Rating;
import com.comparathor.service.RatingService;
import com.comparathor.service.UserSecurityService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {
    private final RatingService ratingService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(RatingController.class);

    @PostMapping
    public ResponseEntity<Rating> createRating(@RequestHeader("Authorization") String token, @RequestBody Rating rating) {
        validateAccess(token, "ROLE_REGISTERED");

        Rating createdRating = ratingService.createRating(rating);
        logger.info("✅ Rating created for product ID: {}", rating.getProductId());
        return ResponseEntity.ok(createdRating);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rating> getRatingById(@PathVariable Long id) {
        Rating rating = ratingService.getRatingById(id);
        logger.info("✅ Rating retrieved with ID: {}", id);
        return ResponseEntity.ok(rating);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Rating>> getRatingsByProductId(@PathVariable Long productId) {
        List<Rating> ratings = ratingService.getRatingsByProductId(productId);
        logger.info("✅ Ratings retrieved for product ID: {}", productId);
        return ResponseEntity.ok(ratings);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rating> updateRating(@RequestHeader("Authorization") String token, @PathVariable Long id, @RequestBody Rating rating) {
        validateAccess(token, "ROLE_REGISTERED");

        Rating updatedRating = ratingService.updateRating(id, rating);
        logger.info("✅ Rating updated with ID: {}", id);
        return ResponseEntity.ok(updatedRating);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRating(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        validateAccess(token, "ROLE_REGISTERED");

        ratingService.deleteRating(id);
        logger.info("✅ Rating deleted with ID: {}", id);
        return ResponseEntity.ok("Rating successfully deleted.");
    }

    @GetMapping
    public ResponseEntity<List<Rating>> getAllRatings(@RequestHeader("Authorization") String token) {
        validateAccess(token, "ROLE_ADMIN");

        List<Rating> allRatings = ratingService.getAllRatings();
        logger.info("✅ Retrieved all ratings.");
        return ResponseEntity.ok(allRatings);
    }

    private void validateAccess(String token, String requiredRole) {
        if (!userSecurityService.hasRole(token, requiredRole)) {
            throw new ForbiddenException("🚫 Access denied. Requires role: " + requiredRole);
        }
    }
}
