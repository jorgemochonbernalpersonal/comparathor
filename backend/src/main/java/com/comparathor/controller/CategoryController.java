package com.comparathor.controller;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ForbiddenException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Category;
import com.comparathor.service.CategoryService;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    private final UserSecurityService userSecurityService;

    private void validateAccess(String token) {
        if (!userSecurityService.hasRole(token, "ROLE_ADMIN")) {
            throw new ForbiddenException("🚫 Acceso denegado. Se requiere el rol: ROLE_ADMIN");
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCategory(
            @RequestHeader("Authorization") String token,
            @RequestBody Category category) {

        validateAccess(token);

        if (category.getName() == null || category.getColor() == null) {
            throw new BadRequestException("❌ El nombre y el color de la categoría son obligatorios.");
        }

        Category createdCategory = categoryService.createCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap("message", "✅ Categoría creada con éxito."));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFilteredCategories(
            @RequestParam(name = "color", required = false) String color,
            @RequestParam(name = "isActive", required = false) Boolean isActive,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortField", required = false) String sortField,
            @RequestParam(name = "sortOrder", required = false) String sortOrder) {

        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : null;

        Map<String, Object> filteredCategories = categoryService.getFilteredCategories(
                color, isActive, startDateTime, endDateTime, page, size, sortField, sortOrder);

        return ResponseEntity.ok(filteredCategories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id)
                .orElseThrow(() -> new ResourceNotFoundException("❌ Categoría con ID " + id + " no encontrada."));
        return ResponseEntity.ok(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCategory(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Category category) {

        validateAccess(token);

        Category updatedCategory = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(Collections.singletonMap("message", "✅ Categoría actualizada con éxito."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCategory(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {

        validateAccess(token);

        categoryService.deleteCategory(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "✅ Categoría eliminada con éxito."));
    }
}
