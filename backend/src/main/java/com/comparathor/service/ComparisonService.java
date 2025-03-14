package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Comparison;
import com.comparathor.repository.ComparisonRepository;
import com.comparathor.repository.ComparisonProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ComparisonService {
    private final ComparisonRepository comparisonRepository;
    private final ComparisonProductRepository comparisonProductRepository;

    public ComparisonService(ComparisonRepository comparisonRepository, ComparisonProductRepository comparisonProductRepository) {
        this.comparisonRepository = comparisonRepository;
        this.comparisonProductRepository = comparisonProductRepository;
    }

    @Transactional(readOnly = true)
    public Comparison getComparisonById(Long id) {
        Comparison comparison = comparisonRepository.findById(id);
        if (comparison == null) {
            throw new ResourceNotFoundException("❌ Comparación no encontrada con ID: " + id);
        }
        comparison.setProductIds(comparisonProductRepository.findProductIdsByComparisonId(id));
        return comparison;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFilteredComparisons(
            Long userId, String title, LocalDateTime startDate, LocalDateTime endDate,
            int page, int size, String sortField, String sortOrder,
            String name, String category, Double price, Integer stock, String brand, String model
    ) {
        size = Math.max(size, 10);

        int totalComparisons = comparisonRepository.countFilteredComparisons(
                userId, title, startDate, endDate, name, category, price, stock, brand, model
        );

        int offset = Math.max(0, (page * size >= totalComparisons) ? totalComparisons - size : page * size);

        List<Comparison> comparisons = comparisonRepository.findFilteredComparisons(
                userId, title, startDate, endDate, name, category, price, stock, brand, model,
                size, offset, sortField, sortOrder
        );

        comparisons.forEach(comparison ->
                comparison.setProductIds(comparisonProductRepository.findProductIdsByComparisonId(comparison.getId()))
        );

        Map<String, Object> response = new HashMap<>();
        response.put("content", comparisons);
        response.put("total", totalComparisons);
        response.put("page", page);
        response.put("size", size);
        return response;
    }

    @Transactional
    public Map<String, Object> createComparison(Long userId, String title, String description, List<Long> productIds) {
        if (title == null || title.trim().isEmpty()) {
            throw new BadRequestException("❌ El título de la comparación es obligatorio.");
        }
        Comparison newComparison = new Comparison();
        newComparison.setUserId(userId);
        newComparison.setTitle(title);
        newComparison.setDescription(description);
        LocalDateTime now = LocalDateTime.now();
        newComparison.setCreatedAt(now);
        newComparison.setUpdatedAt(now);
        comparisonRepository.save(newComparison);
        comparisonProductRepository.insertMultipleComparisonProducts(newComparison.getId(), productIds);

        newComparison.setProductIds(productIds);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Comparación registrada con éxito.");
        response.put("comparison", newComparison);
        return response;
    }

    @Transactional
    public Map<String, Object> updateComparison(Long comparisonId, String title, String description, List<Long> productIds) {
        Comparison existingComparison = comparisonRepository.findById(comparisonId);
        if (existingComparison == null) {
            throw new ResourceNotFoundException("❌ Comparación no encontrada con ID: " + comparisonId);
        }
        existingComparison.setTitle(title != null ? title : existingComparison.getTitle());
        existingComparison.setDescription(description != null ? description : existingComparison.getDescription());
        existingComparison.setUpdatedAt(LocalDateTime.now());
        comparisonRepository.updateComparison(existingComparison.getId(), existingComparison.getTitle(),
                existingComparison.getDescription(), productIds, existingComparison.getUpdatedAt());

        if (productIds != null) {
            comparisonProductRepository.deleteByComparisonId(comparisonId);
            comparisonProductRepository.insertMultipleComparisonProducts(comparisonId, productIds);
            existingComparison.setProductIds(productIds);
        }

        if (productIds != null && !productIds.isEmpty()) {
            comparisonProductRepository.deleteByComparisonId(comparisonId);
            comparisonProductRepository.insertMultipleComparisonProducts(comparisonId, productIds);
            existingComparison.setProductIds(productIds);
        }


        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Comparación actualizada con éxito.");
        return response;
    }

    @Transactional
    public void deleteComparison(Long id) {
        if (comparisonRepository.existsById(id) == 0) {
            throw new ResourceNotFoundException("❌ Comparación no encontrada con ID: " + id);
        }
        comparisonProductRepository.deleteByComparisonId(id);
        comparisonRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Comparison> getComparisonsByUserId(Long userId) {
        List<Comparison> comparisons = comparisonRepository.findByUserId(userId);
        comparisons.forEach(comparison -> comparison.setProductIds(comparisonProductRepository.findProductIdsByComparisonId(comparison.getId())));
        return comparisons;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getProductsByComparisonId(Long comparisonId) {
        if (comparisonId == null || comparisonId <= 0) {
            throw new BadRequestException("❌ ID de comparación inválido.");
        }
        return comparisonProductRepository.findProductsByComparisonId(comparisonId);
    }
}
