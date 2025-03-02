package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Comparison;
import com.comparathor.repository.ComparisonProductRepository;
import com.comparathor.repository.ComparisonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComparisonService {

    private final ComparisonRepository comparisonRepository;
    private final ComparisonProductRepository comparisonProductRepository;

    public ComparisonService(ComparisonRepository comparisonRepository, ComparisonProductRepository comparisonProductRepository) {
        this.comparisonRepository = comparisonRepository;
        this.comparisonProductRepository = comparisonProductRepository;
    }

    @Transactional
    public Comparison createComparison(Comparison comparison) {
        if (comparisonRepository.existsByDescriptionAndUserId(comparison.getDescription(), comparison.getUserId())) {
            throw new BadRequestException("Ya existe una comparación con esta descripción para el usuario.");
        }

        // 🔥 Establecer timestamps automáticamente
        comparison.setCreatedAt(LocalDateTime.now());
        comparison.setUpdatedAt(LocalDateTime.now());

        comparisonRepository.insertComparison(comparison);

        // 🔥 Insertar productos asociados si existen
        if (!comparison.getProductIds().isEmpty()) {
            comparisonProductRepository.insertMultipleComparisonProducts(comparison.getId(), comparison.getProductIds());
        }

        return comparison;
    }

    @Transactional(readOnly = true)
    public Comparison getComparisonById(Long id) {
        Comparison comparison = comparisonRepository.findComparisonById(id);
        if (comparison == null) {
            throw new ResourceNotFoundException("Comparación no encontrada con ID: " + id);
        }

        List<Long> productIds = comparisonProductRepository.findProductIdsByComparisonId(id);
        comparison.setProductIds(productIds);

        return comparison;
    }

    @Transactional(readOnly = true)
    public List<Comparison> getAllComparisons() {
        List<Comparison> comparisons = comparisonRepository.findAllComparisons();
        comparisons.forEach(c -> c.setProductIds(comparisonProductRepository.findProductIdsByComparisonId(c.getId())));
        return comparisons;
    }

    @Transactional
    public void deleteComparison(Long id) {
        if (comparisonRepository.existsById(id) == 0) {
            throw new ResourceNotFoundException("No se encontró la comparación con ID: " + id);
        }

        // 🔥 Eliminar productos asociados antes de eliminar la comparación
        comparisonProductRepository.deleteByComparisonId(id);
        comparisonRepository.deleteComparison(id);
    }

    @Transactional(readOnly = true)
    public List<Comparison> getComparisonsByUserId(Long userId) {
        List<Comparison> comparisons = comparisonRepository.findComparisonsByUserId(userId);
        comparisons.forEach(c -> c.setProductIds(comparisonProductRepository.findProductIdsByComparisonId(c.getId())));
        return comparisons;
    }
}
