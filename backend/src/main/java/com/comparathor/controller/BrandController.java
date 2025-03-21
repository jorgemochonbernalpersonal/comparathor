package com.comparathor.controller;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ForbiddenException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Brand;
import com.comparathor.service.BrandService;
import com.comparathor.service.UserSecurityService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {
    private final BrandService brandService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(BrandController.class);

    private void validateAccess(String token) {
        if (!userSecurityService.hasRole(token, "ROLE_ADMIN")) {
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere el rol: ROLE_ADMIN");
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBrand(
            @RequestHeader("Authorization") String token,
            @RequestBody Brand brand) {

        validateAccess(token);

        if (brand.getName() == null || brand.getReliability() == null) {
            throw new BadRequestException("El nombre y la fiabilidad de la marca son obligatorios.");
        }

        brandService.createBrand(brand);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap("message", "✅ Marca creada con éxito."));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFilteredBrands(
            @RequestParam(name = "reliability", required = false) Integer reliability,
            @RequestParam(name = "isActive", required = false) Boolean isActive,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortField", required = false) String sortField,
            @RequestParam(name = "sortOrder", required = false) String sortOrder) {

        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? startDate.atTime(23, 59, 59) : null;

        Map<String, Object> filteredBrands = brandService.getFilteredBrands(
                reliability, isActive, startDateTime, endDateTime, page, size, sortField, sortOrder);

        return ResponseEntity.ok(filteredBrands);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long id) {
        Brand brand = brandService.getBrandById(id)
                .orElseThrow(() -> new ResourceNotFoundException("❌ Marca con ID " + id + " no encontrada."));
        return ResponseEntity.ok(brand);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBrand(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Brand brand) {

        validateAccess(token);

        brandService.updateBrand(id, brand);
        return ResponseEntity.ok(Collections.singletonMap("message", "✅ Marca actualizada con éxito."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBrand(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {

        validateAccess(token);

        brandService.deleteBrand(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "✅ Marca eliminada con éxito."));
    }
}
