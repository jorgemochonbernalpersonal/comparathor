package com.comparathor.controller;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ForbiddenException;
import com.comparathor.model.Rating;
import com.comparathor.service.RatingService;
import com.comparathor.service.UserSecurityService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {
    private final RatingService ratingService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(RatingController.class);

    @GetMapping
    public Map<String, Object> getRatingsFiltered(
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "productId", required = false) Long productId,
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortField", required = false) String sortField,
            @RequestParam(name = "sortOrder", required = false) String sortOrder) {
        validateAccess(token);
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? startDate.atTime(23, 59, 59) : null;
        return ratingService.getFilteredRatings(productId, userId, startDateTime, endDateTime, page, size, sortField, sortOrder);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createRating(@RequestHeader("Authorization") String token,
                                                            @RequestBody Map<String, Object> request) {
        validateAccess(token);

        if (!request.containsKey("userId") || !request.containsKey("productId") || !request.containsKey("rating")) {
            throw new BadRequestException("❌ Se requiere userId, productId y rating.");
        }

        Long userId = Long.parseLong(request.get("userId").toString());
        Long productId = Long.parseLong(request.get("productId").toString());
        Double rating = Double.parseDouble(request.get("rating").toString());
        String comment = request.getOrDefault("comment", "").toString();

        Map<String, Object> response = ratingService.registerRating(userId, productId, rating, comment);

        logger.info("✅ Rating creado para el producto ID: {}", productId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rating> getRatingById(@PathVariable Long id) {
        Rating rating = ratingService.getRatingById(id);
        logger.info("✅ Rating recuperado con ID: {}", id);
        return ResponseEntity.ok(rating);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRating(@RequestHeader("Authorization") String token,
                                                            @PathVariable Long id,
                                                            @RequestBody Map<String, Object> request) {
        validateAccess(token);

        Double rating = request.containsKey("rating") ? Double.parseDouble(request.get("rating").toString()) : null;
        String comment = request.getOrDefault("comment", "").toString();

        Map<String, Object> response = ratingService.editRating(id, rating, comment);
        logger.info("✅ Rating actualizado con ID: {}", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRating(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        validateAccess(token);
        ratingService.deleteRating(id);
        logger.info("✅ Rating eliminado con ID: {}", id);
        return ResponseEntity.ok(Map.of("message", "✅ Rating eliminado correctamente."));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Rating>> getRatingsByProductId(@RequestHeader("Authorization") String token,
                                                              @PathVariable Long productId) {
        validateAccess(token);
        List<Rating> ratings = ratingService.getRatingsByProductId(productId);
        System.out.println("✅ Ratings recuperados para el producto ID:" + productId);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/product/{productId}/user/{userId}")
    public ResponseEntity<Rating> getUserRatingForProduct(@RequestHeader("Authorization") String token,
                                                          @PathVariable Long productId,
                                                          @PathVariable Long userId) {
        System.out.println(String.format("📥 Petición recibida: Obtener rating para el producto ID: %d y usuario ID: %d", productId, userId));

        validateAccess(token);

        try {
            Rating rating = ratingService.getUserRatingForProduct(productId, userId);

            if (rating == null) {
                System.out.println(String.format("⚠️ No se encontró rating para el producto ID: %d y usuario ID: %d", productId, userId));
                return ResponseEntity.notFound().build();
            }

            System.out.println(String.format("✅ Rating recuperado: %.1f estrellas para el producto ID: %d por el usuario ID: %d",
                    rating.getRating(), productId, userId));

            return ResponseEntity.ok(rating);
        } catch (Exception e) {
            logger.error("❌ Error al obtener el rating para producto {} y usuario {}: {}", productId, userId, e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    private void validateAccess(String token) {
        if (!userSecurityService.hasAnyRole(token, "ROLE_ADMIN", "ROLE_REGISTERED")) {
            logger.warn("🚫 Acceso denegado. Usuario sin los roles requeridos.");
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere ROLE_ADMIN o ROLE_REGISTERED");
        }
    }
}
