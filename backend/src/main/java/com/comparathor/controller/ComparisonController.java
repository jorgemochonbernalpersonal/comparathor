package com.comparathor.controller;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ForbiddenException;
import com.comparathor.model.Comparison;
import com.comparathor.service.ComparisonService;
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
@RequestMapping("/api/comparisons")
@RequiredArgsConstructor
public class ComparisonController {
    private final ComparisonService comparisonService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(ComparisonController.class);

    @GetMapping
    public Map<String, Object> getFilteredComparisons(
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam(name = "title", required = false) String title,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortField", required = false) String sortField,
            @RequestParam(name = "sortOrder", required = false) String sortOrder,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "price", required = false) Double price,
            @RequestParam(name = "stock", required = false) Integer stock,
            @RequestParam(name = "brand", required = false) String brand,
            @RequestParam(name = "model", required = false) String model,
            @RequestParam(name = "comparisonIds", required = false) List<Long> comparisonIds // 🔥 NUEVO
    ) {
        System.out.println("🔎 [Controller] Petición recibida para obtener comparaciones");
        System.out.println("📥 Parámetros: userId=" + userId + ", title=" + title +
                ", startDate=" + startDate + ", endDate=" + endDate);
        System.out.println("📥 Filtros: name=" + name + ", category=" + category +
                ", price=" + price + ", stock=" + stock +
                ", brand=" + brand + ", model=" + model);
        System.out.println("📥 Comparaciones seleccionadas: " + (comparisonIds != null ? comparisonIds : "Ninguna"));

        validateAccess(token);

        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? startDate.atTime(23, 59, 59) : null;

        return comparisonService.getFilteredComparisons(
                userId, title, startDateTime, endDateTime, page, size, sortField, sortOrder,
                name, category, price, stock, brand, model, comparisonIds
        );
    }



    @PostMapping
    public ResponseEntity<Map<String, Object>> createComparison(@RequestHeader("Authorization") String token,
                                                                @RequestBody Map<String, Object> request) {
        validateAccess(token);

        if (!request.containsKey("userId") || !request.containsKey("title") || !request.containsKey("productIds")) {
            throw new BadRequestException("❌ Se requiere userId, title y productIds.");
        }

        Long userId;
        try {
            userId = Long.parseLong(request.get("userId").toString());
        } catch (NumberFormatException e) {
            throw new BadRequestException("❌ userId debe ser un número válido.");
        }

        String title = request.get("title").toString();
        String description = request.getOrDefault("description", "").toString();
        List<Long> productIds;

        try {
            productIds = ((List<?>) request.get("productIds")).stream()
                    .map(p -> Long.parseLong(p.toString()))
                    .toList();
        } catch (Exception e) {
            throw new BadRequestException("❌ productIds debe ser una lista de números.");
        }

        Map<String, Object> response = comparisonService.createComparison(userId, title, description, productIds);
        logger.info("✅ Comparación creada para el usuario ID: {}", userId);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Comparison> getComparisonById(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        validateAccess(token);
        if (id == null || id <= 0) {
            throw new BadRequestException("❌ ID de comparación inválido.");
        }
        Comparison comparison = comparisonService.getComparisonById(id);
        logger.info("✅ Comparación recuperada con ID: {}", id);
        return ResponseEntity.ok(comparison);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateComparison(@RequestHeader("Authorization") String token,
                                                                @PathVariable Long id,
                                                                @RequestBody Map<String, Object> request) {
        validateAccess(token);

        if (id == null || id <= 0) {
            throw new BadRequestException("❌ ID de comparación inválido.");
        }

        String title = request.containsKey("title") ? request.get("title").toString() : null;
        String description = request.getOrDefault("description", "").toString();
        List<Long> productIds = null;

        if (request.containsKey("productIds")) {
            try {
                productIds = (List<Long>) request.get("productIds");
            } catch (ClassCastException e) {
                throw new BadRequestException("❌ productIds debe ser una lista de números.");
            }
        }

        Map<String, Object> response = comparisonService.updateComparison(id, title, description, productIds);
        logger.info("✅ Comparación actualizada con ID: {}", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteComparison(@RequestHeader("Authorization") String token,
                                                                @PathVariable Long id) {
        validateAccess(token);
        if (id == null || id <= 0) {
            throw new BadRequestException("❌ ID de comparación inválido.");
        }
        comparisonService.deleteComparison(id);
        logger.info("✅ Comparación eliminada con ID: {}", id);
        return ResponseEntity.ok(Map.of("message", "✅ Comparación eliminada correctamente."));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Comparison>> getComparisonsByUserId(@RequestHeader("Authorization") String token,
                                                                   @PathVariable Long userId) {
        validateAccess(token);
        if (userId == null || userId <= 0) {
            throw new BadRequestException("❌ ID de usuario inválido.");
        }
        List<Comparison> comparisons = comparisonService.getComparisonsByUserId(userId);
        logger.info("✅ Comparaciones recuperadas para el usuario ID: {}", userId);
        return ResponseEntity.ok(comparisons);
    }

    private void validateAccess(String token) {
        if (!userSecurityService.hasAnyRole(token, "ROLE_ADMIN", "ROLE_REGISTERED")) {
            logger.warn("🚫 Acceso denegado. Usuario sin los roles requeridos.");
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere ROLE_ADMIN o ROLE_REGISTERED");
        }
    }

    @GetMapping("/{comparisonId}/products")
    public ResponseEntity<List<Map<String, Object>>> getComparisonProducts(
            @RequestHeader("Authorization") String token,
            @PathVariable Long comparisonId) {
        validateAccess(token);
        List<Map<String, Object>> products = comparisonService.getProductsByComparisonId(comparisonId);
        return ResponseEntity.ok(products);
    }
}
