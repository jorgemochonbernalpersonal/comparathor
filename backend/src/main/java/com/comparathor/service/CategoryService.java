package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Category;
import com.comparathor.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional
    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new BadRequestException("❌ La categoría '" + category.getName() + "' ya existe.");
        }
        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFilteredCategories(
            String color, Boolean isActive, LocalDateTime startDate, LocalDateTime endDate,
            int page, int size, String sortField, String sortOrder) {

        size = (size <= 0) ? 10 : size;
        int totalCategories = categoryRepository.countFilteredCategories(color, isActive, startDate, endDate);
        int offset = (page * size >= totalCategories) ? Math.max(0, totalCategories - size) : page * size;

        List<Category> categories = categoryRepository.findFilteredCategories(
                color, isActive, startDate, endDate, size, offset, sortField, sortOrder);

        Map<String, Object> response = new HashMap<>();
        response.put("content", categories);
        response.put("total", totalCategories);
        response.put("page", page);
        response.put("size", size);

        return response;
    }

    @Transactional(readOnly = true)
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    @Transactional
    public Category updateCategory(Long id, Category category) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("❌ Categoría con ID " + id + " no encontrada."));

        if (category.getName() != null && !category.getName().equals(existingCategory.getName())) {
            if (categoryRepository.existsByName(category.getName())) {
                throw new BadRequestException("❌ La categoría '" + category.getName() + "' ya existe.");
            }
            existingCategory.setName(category.getName());
        }

        if (category.getDescription() != null) {
            existingCategory.setDescription(category.getDescription());
        }

        if (category.getColor() != null) {
            existingCategory.setColor(category.getColor());
        }

        if (category.getIsActive() != null) {
            existingCategory.setIsActive(category.getIsActive());
        }

        return categoryRepository.save(existingCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("❌ Categoría con ID " + id + " no encontrada.");
        }

        categoryRepository.delete(id);
    }

}
