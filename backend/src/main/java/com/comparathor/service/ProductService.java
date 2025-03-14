package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Product;
import com.comparathor.repository.ProductRepository;
import io.jsonwebtoken.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {
    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;


    public ProductService(ProductRepository productRepository, CloudinaryService cloudinaryService) {
        this.productRepository = productRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFilteredProducts(
            String name, String category, String brand, Double minPrice, Double maxPrice, Integer stock,
            String searchTerm, LocalDateTime startDate, LocalDateTime endDate,
            int page, int size, String sortField, String sortOrder) {
        size = (size <= 0) ? 10 : size;
        int totalProducts = productRepository.countFilteredProducts(
                name, category, brand, minPrice, maxPrice, stock, searchTerm, startDate, endDate);
        int offset = (page * size >= totalProducts) ? Math.max(0, totalProducts - size) : page * size;
        List<Product> products = productRepository.findFilteredProducts(
                name, category, brand, minPrice, maxPrice, stock, searchTerm,
                startDate, endDate, size, offset, sortField, sortOrder);
        Map<String, Object> response = new HashMap<>();
        response.put("content", products);
        response.put("total", totalProducts);
        response.put("page", page);
        response.put("size", size);
        return response;
    }

    @Transactional
    public Map<String, Object> createProduct(
            String name, String category, Double price, Integer stock,
            String description, String brand, String model, MultipartFile image, String createdBy) {

        if (productRepository.existsByName(name) > 0) {
            throw new BadRequestException("🚫 Ya existe un producto con el nombre: " + name);
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            try {
                imageUrl = cloudinaryService.uploadImage(image);
            } catch (IOException e) {
                throw new BadRequestException("Error al subir imagen a Cloudinary.");
            } catch (java.io.IOException e) {
                throw new RuntimeException(e);
            }
        }
        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setPrice(price);
        product.setStock(stock);
        product.setDescription(description);
        product.setBrand(brand);
        product.setModel(model);
        product.setImageUrl(imageUrl);
        LocalDateTime now = LocalDateTime.now();
        product.setCreatedAt(now);
        product.setUpdatedAt(now);
        productRepository.save(product);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Producto registrado con éxito.");
        response.put("product", product);
        return response;
    }

    @Transactional
    public Map<String, Object> updateProduct(Long productId, Map<String, String> request, String updatedBy, MultipartFile image) {
        Product product = productRepository.findById(productId);
        if (product == null) {
            throw new BadRequestException("El producto con ID " + productId + " no existe.");
        }

        if (request.containsKey("name")) {
            String newName = request.get("name");
            if (!newName.equalsIgnoreCase(product.getName()) && productRepository.existsByName(newName) > 0) {
                throw new BadRequestException("El nombre del producto '" + newName + "' ya está en uso.");
            }
            product.setName(newName);
        }
        if (request.containsKey("category")) product.setCategory(request.get("category"));
        if (request.containsKey("price")) product.setPrice(Double.valueOf(request.get("price")));
        if (request.containsKey("stock")) product.setStock(Integer.valueOf(request.get("stock")));
        if (request.containsKey("description")) product.setDescription(request.get("description"));
        if (request.containsKey("brand")) product.setBrand(request.get("brand"));
        if (request.containsKey("model")) product.setModel(request.get("model"));

        if (image != null && !image.isEmpty()) {
            try {
                if (product.getImageUrl() != null) {
                    String publicId = cloudinaryService.extractPublicIdFromUrl(product.getImageUrl());
                    cloudinaryService.deleteImage(publicId);
                }
                String newImageUrl = cloudinaryService.uploadImage(image);
                product.setImageUrl(newImageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Error al manejar la imagen en Cloudinary.");
            } catch (java.io.IOException e) {
                throw new RuntimeException(e);
            }
        }

        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Producto actualizado con éxito.");
        response.put("product", product);
        return response;
    }

    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId);

        if (product == null) {
            throw new ResourceNotFoundException("❌ Producto con ID " + productId + " no encontrado.");
        }

        if (product.getImageUrl() != null) {
            try {
                String publicId = cloudinaryService.extractPublicIdFromUrl(product.getImageUrl());
                cloudinaryService.deleteImage(publicId);
                logger.info("✅ Imagen eliminada en Cloudinary: {}", publicId);
            } catch (IOException | java.io.IOException e) {
                logger.warn("⚠️ No se pudo eliminar la imagen en Cloudinary: {}", e.getMessage());
            }
        }

        productRepository.delete(productId);
        logger.info("✅ Producto eliminado de la base de datos: ID {}", productId);
    }

}
