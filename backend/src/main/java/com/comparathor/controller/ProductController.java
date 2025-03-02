package com.comparathor.controller;

import com.comparathor.exception.ForbiddenException;
import com.comparathor.model.Product;
import com.comparathor.service.ProductService;
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
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestHeader("Authorization") String token, @RequestBody Product product) {
        validarAcceso(token, "ROLE_ADMIN");

        Product createdProduct = productService.createProduct(product);
        logger.info("✅ Producto creado con ID: {}", createdProduct.getId());
        return ResponseEntity.ok(createdProduct);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        logger.info("✅ Producto obtenido con ID: {}", id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/filter")
    public Map<String, Object> getProductsFiltered(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "minPrice", required = false) Double minPrice,
            @RequestParam(name = "maxPrice", required = false) Double maxPrice,
            @RequestParam(name = "stock", required = false) Integer stock,
            @RequestParam(name = "brand", required = false) String brand,
            @RequestParam(name = "model", required = false) String model,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? startDate.atTime(23, 59, 59) : null;
        return productService.getFilteredProducts(name, category, minPrice, maxPrice, stock, brand, model, startDateTime, endDateTime, page, size);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        validarAcceso(token, "ROLE_ADMIN");

        productService.deleteProduct(id);
        logger.info("✅ Producto eliminado con ID: {}", id);
        return ResponseEntity.ok("Producto eliminado correctamente.");
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        List<Product> products = productService.findByCategory(category);
        logger.info("✅ Productos obtenidos para la categoría: {}", category);
        return ResponseEntity.ok(products);
    }

    private void validarAcceso(String token, String role) {
        if (!userSecurityService.hasRole(token, role)) {
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere el rol: " + role);
        }
    }
}
