package com.comparathor.service;

import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.ComparisonProduct;
import com.comparathor.repository.ComparisonProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComparisonProductService {

    private final ComparisonProductRepository comparisonProductRepository;

    public ComparisonProductService(ComparisonProductRepository comparisonProductRepository) {
        this.comparisonProductRepository = comparisonProductRepository;
    }

    @Transactional(readOnly = true)
    public ComparisonProduct getComparisonProductById(Long id) {
        ComparisonProduct comparisonProduct = comparisonProductRepository.findById(id);
        if (comparisonProduct == null) {
            throw new ResourceNotFoundException("Producto de comparación no encontrado con ID: " + id);
        }
        return comparisonProduct;
    }

    @Transactional(readOnly = true)
    public List<ComparisonProduct> getAllComparisonProducts() {
        return comparisonProductRepository.findAllComparisonProducts();
    }

    @Transactional(readOnly = true)
    public List<ComparisonProduct> getComparisonProductsByComparisonId(Long comparisonId) {
        return comparisonProductRepository.findComparisonProductsByComparisonId(comparisonId);
    }

    @Transactional
    public ComparisonProduct createComparisonProduct(ComparisonProduct comparisonProduct) {
        comparisonProduct.setCreatedAt(LocalDateTime.now());
        comparisonProduct.setUpdatedAt(LocalDateTime.now());
        comparisonProductRepository.insertComparisonProduct(comparisonProduct);
        return comparisonProduct;
    }

    @Transactional
    public void createMultipleComparisonProducts(Long comparisonId, List<Long> productIds) {
        if (productIds.isEmpty()) {
            throw new IllegalArgumentException("No se pueden agregar productos vacíos a la comparación.");
        }
        comparisonProductRepository.insertMultipleComparisonProducts(comparisonId, productIds);
    }

    @Transactional
    public void deleteComparisonProduct(Long id) {
        if (comparisonProductRepository.existsById(id) == 0) {
            throw new ResourceNotFoundException("No se encontró el producto de comparación con ID: " + id);
        }
        comparisonProductRepository.deleteComparisonProduct(id);
    }

    @Transactional
    public void deleteAllProductsByComparisonId(Long comparisonId) {
        comparisonProductRepository.deleteByComparisonId(comparisonId);
    }
}
