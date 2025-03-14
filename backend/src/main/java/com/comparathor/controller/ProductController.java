package com.comparathor.controller;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ForbiddenException;
import com.comparathor.exception.ResourceNotFoundException;

import com.comparathor.service.ProductService;
import com.comparathor.service.UserSecurityService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Map<String, Object>> createProduct(
            @RequestHeader("Authorization") String token,
            @RequestPart("data") String requestData,
            @RequestPart("image") MultipartFile image) {

        validateAccess(token);
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> request;

        try {
            request = objectMapper.readValue(requestData, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            throw new BadRequestException("❌ Error al procesar JSON.");
        }

        if (!request.containsKey("name") || !request.containsKey("category") ||
                !request.containsKey("price") || !request.containsKey("stock") ||
                !request.containsKey("description") || !request.containsKey("brand") ||
                !request.containsKey("model")) {
            throw new BadRequestException("❌ Se requieren todos los campos.");
        }

        String createdBy = userSecurityService.getUsernameFromToken(token);
        Map<String, Object> response = productService.createProduct(
                request.get("name").toString(),
                request.get("category").toString(),
                Double.valueOf(request.get("price").toString()),
                Integer.valueOf(request.get("stock").toString()),
                request.get("description").toString(),
                request.get("brand").toString(),
                request.get("model").toString(),
                image,
                createdBy
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public Map<String, Object> getFilteredProducts(
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "brand", required = false) String brand,
            @RequestParam(name = "minPrice", required = false) Double minPrice,
            @RequestParam(name = "maxPrice", required = false) Double maxPrice,
            @RequestParam(name = "stock", required = false) Integer stock,
            @RequestParam(name = "searchTerm", required = false) String searchTerm,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortField", required = false) String sortField,
            @RequestParam(name = "sortOrder", required = false) String sortOrder) {
        validateAccess(token);
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : null;
        return productService.getFilteredProducts(name, category, brand, minPrice, maxPrice, stock, searchTerm, startDateTime, endDateTime, page, size, sortField, sortOrder);
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Map<String, Object>> updateProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestPart("data") String requestData,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        validateAccess(token);
        String updatedBy = userSecurityService.getUsernameFromToken(token);

        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, String> request;

        try {
            request = objectMapper.readValue(requestData, new TypeReference<Map<String, String>>() {});
        } catch (JsonProcessingException e) {
            throw new BadRequestException("Error al procesar JSON.");
        }

        if (request.isEmpty() && image == null) {
            throw new BadRequestException("Se requiere al menos un campo para actualizar.");
        }

        Map<String, Object> response = productService.updateProduct(id, request, updatedBy, image);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        validateAccess(token);
        try {
            productService.deleteProduct(id);
            logger.info("✅ Producto eliminado con ID: {}", id);
            return ResponseEntity.ok(Collections.singletonMap("message", "✅ Producto eliminado exitosamente."));
        } catch (ResourceNotFoundException e) {
            logger.warn("❌ Error al eliminar, producto no encontrado (ID: {}): {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Error inesperado al eliminar producto (ID: {}): {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error interno al eliminar el producto."));
        }
    }

    private void validateAccess(String token) {
        if (!userSecurityService.hasAnyRole(token, "ROLE_ADMIN", "ROLE_REGISTERED")) {
            logger.warn("🚫 Acceso denegado. Usuario sin los roles requeridos.");
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere ROLE_ADMIN o ROLE_REGISTERED");
        }
    }
}
