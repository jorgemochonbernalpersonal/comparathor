package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Product;
import com.comparathor.repository.BrandRepository;
import com.comparathor.repository.CategoryRepository;
import com.comparathor.repository.ProductRepository;
import com.comparathor.utils.FileMultipartUtil;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.javassist.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductService {
    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public Map<String, Object> getFilteredProducts(
            String search,
            String name,
            Long categoryId, Long brandId, Double minPrice, Double maxPrice,
            Integer minStock, Integer maxStock, LocalDateTime startDate,
            LocalDateTime endDate, int page, int size,
            String sortField, String sortOrder) {

        size = (size <= 0) ? 10 : size;

        int totalProducts = productRepository.countFilteredProducts(
                search,
                name, categoryId, brandId, minPrice, maxPrice, minStock, maxStock, startDate, endDate);
        int offset = (page * size >= totalProducts) ? Math.max(0, totalProducts - size) : page * size;
        List<Product> products = productRepository.findFilteredProducts(
                search,
                name, categoryId, brandId, minPrice, maxPrice, minStock, maxStock,
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
            String name, Long categoryId, Double price, Integer stock,
            Long brandId, String model, MultipartFile image, String description, String createdBy) {
        if (productRepository.existsByName(name)) {
            throw new BadRequestException("Ya existe un producto con el nombre: " + name);
        }
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            try {
                imageUrl = cloudinaryService.uploadImage(image);
            } catch (IOException | java.io.IOException e) {
                throw new BadRequestException("Error al subir imagen a Cloudinary.");
            }
        }
        Product product = new Product();
        product.setName(name);
        product.setCategoryId(categoryId);
        product.setPrice(price);
        product.setStock(stock);
        product.setBrandId(brandId);
        product.setModel(model);
        product.setDescription(description);
        product.setImageUrl(imageUrl);
        LocalDateTime now = LocalDateTime.now();
        product.setCreatedAt(now);
        product.setUpdatedAt(now);
        product.setCreatedBy(createdBy);
        productRepository.save(product);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Producto registrado con éxito.");
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
            if (!newName.equalsIgnoreCase(product.getName()) && productRepository.existsByName(newName)) {
                throw new BadRequestException("El nombre del producto '" + newName + "' ya está en uso.");
            }
            product.setName(newName);
        }

        if (request.containsKey("categoryId")) {
            product.setCategoryId(Long.valueOf(request.get("categoryId")));
        }
        if (request.containsKey("price")) {
            product.setPrice(Double.valueOf(request.get("price")));
        }
        if (request.containsKey("stock")) {
            product.setStock(Integer.valueOf(request.get("stock")));
        }
        if (request.containsKey("brandId")) {
            product.setBrandId(Long.valueOf(request.get("brandId")));
        }
        if (request.containsKey("model")) {
            product.setModel(request.get("model"));
        }
        if (request.containsKey("description")) {
            product.setDescription(request.get("description"));
        }

        if (image != null && !image.isEmpty()) {
            try {
                if (product.getImageUrl() != null) {
                    String publicId = cloudinaryService.extractPublicIdFromUrl(product.getImageUrl());
                    cloudinaryService.deleteImage(publicId);
                }
                String newImageUrl = cloudinaryService.uploadImage(image);
                product.setImageUrl(newImageUrl);
            } catch (IOException | java.io.IOException e) {
                throw new RuntimeException("Error al manejar la imagen en Cloudinary.");
            }
        }

        product.setUpdatedAt(LocalDateTime.now());
        product.setCreatedBy(updatedBy);
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
            throw new ResourceNotFoundException("Producto con ID " + productId + " no encontrado.");
        }

        if (product.getImageUrl() != null) {
            try {
                String publicId = cloudinaryService.extractPublicIdFromUrl(product.getImageUrl());
                cloudinaryService.deleteImage(publicId);
            } catch (IOException | java.io.IOException e) {
                logger.warn("No se pudo eliminar la imagen en Cloudinary: {}", e.getMessage());
            }
        }
        productRepository.deleteById(productId);
    }

    @Transactional
    public Map<String, Object> uploadMassiveImages(MultipartFile zipFile) {
        if (zipFile.isEmpty()) {
            throw new BadRequestException("Archivo ZIP vacío.");
        }
        Map<String, String> uploadedImages = new HashMap<>();
        List<String> errors = new ArrayList<>();
        List<Product> productsToUpdate = new ArrayList<>();
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("uploaded-images");
            File zipTempFile = Files.createTempFile(tempDir, "images", ".zip").toFile();
            zipFile.transferTo(zipTempFile);
            try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipTempFile))) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    String fileName = Paths.get(entry.getName()).getFileName().toString();
                    if (!entry.isDirectory() && (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".png"))) {
                        File tempImageFile = new File(tempDir.toFile(), fileName);

                        try (FileOutputStream fos = new FileOutputStream(tempImageFile)) {
                            zis.transferTo(fos);
                        }
                        MultipartFile multipartFile = FileMultipartUtil.convertFileToMultipartFile(tempImageFile, "image/jpeg");
                        String imageUrl = cloudinaryService.uploadImage(multipartFile);
                        if (imageUrl == null || imageUrl.isEmpty()) {
                            errors.add("No se pudo subir la imagen: " + fileName);
                            continue;
                        }
                        uploadedImages.put(fileName, imageUrl);
                    }
                }
            }

            for (Map.Entry<String, String> entry : uploadedImages.entrySet()) {
                String fileName = entry.getKey();
                String imageUrl = entry.getValue();
                String normalizedFileName = extractFileNameWithoutExtension(fileName);

                Optional<Product> productOpt = productRepository.findByImageUrl(normalizedFileName);
                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    product.setImageUrl(imageUrl);
                    product.setUpdatedAt(LocalDateTime.now());
                    productsToUpdate.add(product);
                } else {
                    errors.add("No se encontró producto con imageUrl: " + normalizedFileName);
                }
            }

            if (!productsToUpdate.isEmpty()) {
                productRepository.updateAll(productsToUpdate);
            }
            String message = productsToUpdate.isEmpty() ? "No se actualizaron productos." : "Imágenes subidas y actualizadas exitosamente.";
            return Map.of(
                    "success", true,
                    "message", message,
                    "updatedProducts", productsToUpdate.size(),
                    "errors", errors
            );

        } catch (IOException e) {
            throw new RuntimeException("Error al extraer archivo ZIP: " + e.getMessage());
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (java.io.IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (tempDir != null) {
                try {
                    Files.walk(tempDir).map(Path::toFile).forEach(File::delete);
                    Files.deleteIfExists(tempDir);
                } catch (IOException | java.io.IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }

    private String extractFileNameWithoutExtension(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return "";
        }
        if (fileName.contains("/")) {
            fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
        }
        if (fileName.contains(".")) {
            fileName = fileName.substring(0, fileName.lastIndexOf("."));
        }
        return fileName.trim().toLowerCase();
    }

    @Transactional
    public Map<String, Object> bulkInsertProducts(List<Map<String, Object>> productsData) {
        List<Product> productsToSave = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Map<String, Object> row : productsData) {
            try {
                String name = getString(row.get("name"));
                String categoryName = getString(row.containsKey("category_name") ? row.get("category_name") : row.get("category"));
                String brandName = getString(row.containsKey("brand_name") ? row.get("brand_name") : row.get("brand"));
                Double price = getDouble(row.get("price"));
                Integer stock = getInteger(row.get("stock"));
                String model = getString(row.get("model"));
                String imageUrl = getString(row.get("imageUrl"));
                Object descRaw = row.get("description");
                String description = descRaw != null ? descRaw.toString() : null;
                if (name == null || categoryName == null || brandName == null || price == null ||
                        stock == null || model == null || imageUrl == null || description == null) {
                    errors.add("Datos incompletos en fila: " + row);
                    continue;
                }
                Long categoryId = categoryRepository.findIdByName(categoryName);
                if (categoryId == null) {
                    errors.add("Categoría '" + categoryName + "' no encontrada.");
                    continue;
                }
                Long brandId = brandRepository.findIdByName(brandName);
                if (brandId == null) {
                    errors.add("Marca '" + brandName + "' no encontrada.");
                    continue;
                }
                Product product = new Product();
                product.setName(name);
                product.setCategoryId(categoryId);
                product.setBrandId(brandId);
                product.setPrice(price);
                product.setStock(stock);
                product.setModel(model);
                product.setImageUrl(imageUrl);
                product.setDescription(description);
                product.setCreatedAt(now);
                product.setUpdatedAt(now);
                productsToSave.add(product);
            } catch (Exception e) {
                String errorMessage = "Error al procesar producto: " + e.getMessage();
                errors.add(errorMessage);
            }
        }
        if (!productsToSave.isEmpty()) {
            productRepository.saveAll(productsToSave);
        }
        return Map.of(
                "message", "📊 Productos insertados: " + productsToSave.size(),
                "errors", errors
        );
    }

    private String getString(Object value) {
        return (value instanceof String) ? ((String) value).trim() : null;
    }

    private Double getDouble(Object value) {
        try {
            return (value instanceof Number) ? ((Number) value).doubleValue() : Double.parseDouble(value.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private Integer getInteger(Object value) {
        try {
            return (value instanceof Number) ? ((Number) value).intValue() : Integer.parseInt(value.toString());
        } catch (Exception e) {
            return null;
        }
    }
}


