package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Product;
import com.comparathor.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional
    public Product createProduct(Product product) {
        if (productRepository.existsByName(product.getName()) > 0) {
            throw new BadRequestException("El producto con nombre '" + product.getName() + "' ya existe.");
        }

        productRepository.insertProduct(product);
        return product;
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        Product product = productRepository.findById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Producto no encontrado con ID: " + id);
        }
        return product;
    }

    public Map<String, Object> getFilteredProducts(String name, String category, Double minPrice, Double maxPrice,
                                                   Integer stock, String brand, String model, LocalDateTime startDate,
                                                   LocalDateTime endDate, int page, int size) {
        int offset = page * size;
        List<Product> products = productRepository.findFilteredProducts(name, category, minPrice, maxPrice,
                stock, brand, model, startDate, endDate, offset, size);
        int totalProducts = productRepository.countFilteredProducts(name, category, minPrice, maxPrice,
                stock, brand, model, startDate, endDate);

        Map<String, Object> response = new HashMap<>();
        response.put("totalProducts", totalProducts);
        response.put("content", products);
        return response;
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (productRepository.existsById(id) == 0) {
            throw new ResourceNotFoundException("No se encontró el producto con ID: " + id);
        }
        productRepository.deleteProduct(id);
    }

    @Transactional(readOnly = true)
    public List<Product> findByCategory(String category) {
        List<Product> products = productRepository.findByCategory(category);
        if (products.isEmpty()) {
            throw new ResourceNotFoundException("No se encontraron productos en la categoría: " + category);
        }
        return products;
    }

    @Transactional
    public Product updateProduct(Long id, Product product) {
        if (productRepository.existsById(id) == 0) {
            throw new ResourceNotFoundException("No se encontró el producto con ID: " + id);
        }

        product.setId(id); // Asegurar que se actualiza el producto correcto
        productRepository.updateProduct(product);
        return product;
    }
}
