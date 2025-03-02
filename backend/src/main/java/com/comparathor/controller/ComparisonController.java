package com.comparathor.controller;

import com.comparathor.exception.ForbiddenException;
import com.comparathor.model.Comparison;
import com.comparathor.service.ComparisonService;
import com.comparathor.service.UserSecurityService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comparisons")
@RequiredArgsConstructor
public class ComparisonController {

    private final ComparisonService comparisonService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(ComparisonController.class);

    @PostMapping
    public ResponseEntity<Comparison> createComparison(@RequestHeader("Authorization") String token, @RequestBody Comparison comparison) {
        validarAcceso(token, "ROLE_REGISTERED");

        Comparison createdComparison = comparisonService.createComparison(comparison);
        logger.info("✅ Comparación creada con ID: {}", createdComparison.getId());
        return ResponseEntity.ok(createdComparison);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comparison> getComparisonById(@PathVariable Long id) {
        Comparison comparison = comparisonService.getComparisonById(id);
        logger.info("✅ Comparación obtenida con ID: {}", id);
        return ResponseEntity.ok(comparison);
    }

    @GetMapping
    public ResponseEntity<List<Comparison>> getAllComparisons(@RequestHeader("Authorization") String token) {
        validarAcceso(token, "ROLE_ADMIN");

        List<Comparison> comparisons = comparisonService.getAllComparisons();
        logger.info("✅ Obteniendo todas las comparaciones.");
        return ResponseEntity.ok(comparisons);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComparison(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        validarAcceso(token, "ROLE_REGISTERED");

        comparisonService.deleteComparison(id);
        logger.info("✅ Comparación eliminada con ID: {}", id);
        return ResponseEntity.ok("Comparación eliminada correctamente.");
    }

    private void validarAcceso(String token, String role) {
        if (!userSecurityService.hasRole(token, role)) {
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere el rol: " + role);
        }
    }
}
