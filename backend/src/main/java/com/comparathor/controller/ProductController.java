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
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<Map<String, Object>> createProduct(
            @RequestHeader("Authorization") String token,
            @RequestPart("data") String requestData,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        validateAccess(token);
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> request;

        try {
            request = objectMapper.readValue(requestData, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            throw new BadRequestException("Error al procesar JSON.");
        }

        if (!request.containsKey("name") || !request.containsKey("categoryId") ||
                !request.containsKey("price") || !request.containsKey("stock") ||
                !request.containsKey("brandId") || !request.containsKey("model") ||
                !request.containsKey("description")) {
            throw new BadRequestException("Se requieren todos los campos.");
        }
        String createdBy = userSecurityService.getUsernameFromToken(token);
        Map<String, Object> response = productService.createProduct(
                request.get("name").toString(),
                Long.valueOf(request.get("categoryId").toString()),
                Double.valueOf(request.get("price").toString()),
                Integer.valueOf(request.get("stock").toString()),
                Long.valueOf(request.get("brandId").toString()),
                request.get("model").toString(),
                image,
                request.get("description").toString(),
                createdBy
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFilteredProducts(
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "brandId", required = false) Long brandId,
            @RequestParam(name = "minPrice", required = false) Double minPrice,
            @RequestParam(name = "maxPrice", required = false) Double maxPrice,
            @RequestParam(name = "minStock", required = false) Integer minStock,
            @RequestParam(name = "maxStock", required = false) Integer maxStock,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortField", required = false, defaultValue = "id") String sortField,
            @RequestParam(name = "sortOrder", required = false, defaultValue = "asc") String sortOrder) {
        validateAccess(token);
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : null;
        try {
            Map<String, Object> result = productService.getFilteredProducts(search,
                    name, categoryId, brandId, minPrice, maxPrice, minStock, maxStock,
                    startDateTime, endDateTime, page, size, sortField, sortOrder
            );
            if (result == null || result.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(Collections.emptyMap());
            } else {
                return ResponseEntity.ok(result);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Ocurrió un error al obtener los productos."));
        }
    }

    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
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
            request = objectMapper.readValue(requestData, new TypeReference<>() {
            });
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
            return ResponseEntity.ok(Collections.singletonMap("message", "Producto eliminado exitosamente."));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error interno al eliminar el producto."));
        }
    }

    private void validateAccess(String token) {
        if (!userSecurityService.hasAnyRole(token, "ROLE_ADMIN", "ROLE_REGISTERED")) {
            logger.warn("Acceso denegado. Usuario sin los roles requeridos.");
            throw new ForbiddenException("Acceso denegado. Se requiere ROLE_ADMIN o ROLE_REGISTERED");
        }
    }

    @PostMapping(value = "/upload-massive-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadMassiveImages(
            @RequestHeader("Authorization") String token,
            @RequestParam("file") MultipartFile zipFile) {
        validateAccess(token);
        try {
            Map<String, Object> response = productService.uploadMassiveImages(zipFile);
            Map<String, Object> modifiableResponse = new HashMap<>(response);
            modifiableResponse.putIfAbsent("success", true);
            return ResponseEntity.ok(modifiableResponse);
        } catch (BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage(), "errors", e.getDetails()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error interno al procesar el archivo ZIP."));
        }
    }
}
