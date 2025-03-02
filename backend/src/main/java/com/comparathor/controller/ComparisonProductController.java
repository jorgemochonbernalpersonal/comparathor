package com.comparathor.controller;

import com.comparathor.exception.ForbiddenException;
import com.comparathor.model.ComparisonProduct;
import com.comparathor.service.ComparisonProductService;
import com.comparathor.service.UserSecurityService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comparison-products")
@RequiredArgsConstructor
public class ComparisonProductController {
    private final ComparisonProductService comparisonProductService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(ComparisonProductController.class);

    @PostMapping
    public ResponseEntity<ComparisonProduct> createComparisonProduct(
            @RequestHeader("Authorization") String token,
            @RequestBody ComparisonProduct comparisonProduct) {

        validarAcceso(token, "ROLE_REGISTERED");

        ComparisonProduct savedComparisonProduct = comparisonProductService.createComparisonProduct(comparisonProduct);
        logger.info("✅ Producto de comparación creado con ID: {}", savedComparisonProduct.getId());
        return ResponseEntity.ok(savedComparisonProduct);
    }

    @PostMapping("/bulk")
    public ResponseEntity<String> createMultipleComparisonProducts(
            @RequestHeader("Authorization") String token,
            @RequestParam Long comparisonId,
            @RequestBody List<Long> productIds) {

        validarAcceso(token, "ROLE_REGISTERED");

        comparisonProductService.createMultipleComparisonProducts(comparisonId, productIds);
        logger.info("✅ {} productos agregados a la comparación con ID: {}", productIds.size(), comparisonId);
        return ResponseEntity.ok("Productos agregados correctamente.");
    }

    @GetMapping
    public ResponseEntity<List<ComparisonProduct>> getAllComparisonProducts(@RequestHeader("Authorization") String token) {
        validarAcceso(token, "ROLE_ADMIN");

        List<ComparisonProduct> comparisonProducts = comparisonProductService.getAllComparisonProducts();
        logger.info("✅ Obtenidos {} productos de comparación.", comparisonProducts.size());
        return ResponseEntity.ok(comparisonProducts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComparisonProduct> getComparisonProductById(@PathVariable Long id) {
        ComparisonProduct comparisonProduct = comparisonProductService.getComparisonProductById(id);
        logger.info("✅ Producto de comparación obtenido con ID: {}", id);
        return ResponseEntity.ok(comparisonProduct);
    }

    @GetMapping("/comparison/{comparisonId}")
    public ResponseEntity<List<ComparisonProduct>> getComparisonProductsByComparisonId(@PathVariable Long comparisonId) {
        List<ComparisonProduct> comparisonProducts = comparisonProductService.getComparisonProductsByComparisonId(comparisonId);
        logger.info("✅ {} productos obtenidos para la comparación con ID: {}", comparisonProducts.size(), comparisonId);
        return ResponseEntity.ok(comparisonProducts);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComparisonProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {

        validarAcceso(token, "ROLE_REGISTERED");

        comparisonProductService.deleteComparisonProduct(id);
        logger.info("✅ Producto de comparación eliminado con ID: {}", id);
        return ResponseEntity.ok("Producto de comparación eliminado correctamente.");
    }

    @DeleteMapping("/comparison/{comparisonId}")
    public ResponseEntity<String> deleteAllProductsByComparisonId(
            @RequestHeader("Authorization") String token,
            @PathVariable Long comparisonId) {

        validarAcceso(token, "ROLE_ADMIN");

        comparisonProductService.deleteAllProductsByComparisonId(comparisonId);
        logger.info("✅ Todos los productos eliminados de la comparación con ID: {}", comparisonId);
        return ResponseEntity.ok("Todos los productos de la comparación han sido eliminados.");
    }

    private void validarAcceso(String token, String role) {
        if (!userSecurityService.hasRole(token, role)) {
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere el rol: " + role);
        }
    }
}
