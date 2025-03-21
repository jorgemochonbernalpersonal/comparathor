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
            String name, String category, Double price, Integer stock, String brand, String model,
            List<Long> comparisonIds // 🔥 NUEVO: Filtrar por IDs de comparaciones seleccionadas
    ) {
        System.out.println("🔎 [Service] getFilteredComparisons ejecutado");
        System.out.println("📥 Parámetros recibidos en el servicio:");
        System.out.println("   - userId: " + userId);
        System.out.println("   - title: " + title);
        System.out.println("   - startDate: " + startDate);
        System.out.println("   - endDate: " + endDate);
        System.out.println("   - name: " + name);
        System.out.println("   - category: " + category);
        System.out.println("   - price: " + price);
        System.out.println("   - stock: " + stock);
        System.out.println("   - brand: " + brand);
        System.out.println("   - model: " + model);
        System.out.println("   - comparisonIds: " + (comparisonIds != null ? comparisonIds : "No filtrado"));

        size = Math.max(size, 10);

        int totalComparisons;
        try {
            totalComparisons = comparisonRepository.countFilteredComparisons(
                    userId, title, startDate, endDate, name, category, price, stock, brand, model, comparisonIds
            );
            System.out.println("✅ Total de comparaciones encontradas: " + totalComparisons);
        } catch (Exception e) {
            System.err.println("❌ Error al contar comparaciones: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al contar comparaciones", e);
        }

        int offset = Math.max(0, (page * size >= totalComparisons) ? totalComparisons - size : page * size);
        System.out.println("📊 Offset calculado: " + offset);

        List<Comparison> comparisons;
        try {
            comparisons = comparisonRepository.findFilteredComparisons(
                    userId, title, startDate, endDate, name, category, price, stock, brand, model,
                    comparisonIds, size, offset, sortField, sortOrder
            );
            System.out.println("✅ Comparaciones obtenidas: " + comparisons.size());
        } catch (Exception e) {
            System.err.println("❌ Error al obtener comparaciones: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al obtener comparaciones", e);
        }

        try {
            comparisons.forEach(comparison -> {
                List<Long> productIds = comparisonProductRepository.findProductIdsByComparisonId(comparison.getId());
                comparison.setProductIds(productIds);
                System.out.println("🛒 Productos encontrados para comparación ID " + comparison.getId() + ": " + productIds);
            });
        } catch (Exception e) {
            System.err.println("❌ Error al obtener productos de comparaciones: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al obtener productos de comparaciones", e);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", comparisons);
        response.put("total", totalComparisons);
        response.put("page", page);
        response.put("size", size);

        System.out.println("📦 Respuesta generada con éxito.");
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
