package com.comparathor.service;

import com.comparathor.exception.BadRequestException;
import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.Brand;
import com.comparathor.repository.BrandRepository;
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
public class BrandService {
    private final BrandRepository brandRepository;

    @Transactional
    public Brand createBrand(Brand brand) {
        if (brandRepository.existsByName(brand.getName())) {
            throw new BadRequestException("La marca '" + brand.getName() + "' ya existe.");
        }
        return brandRepository.save(brand);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFilteredBrands(
            Integer reliability, Boolean isActive, LocalDateTime startDate, LocalDateTime endDate,
            int page, int size, String sortField, String sortOrder) {

        size = (size <= 0) ? 10 : size;
        int totalBrands = brandRepository.countFilteredBrands(reliability, isActive, startDate, endDate);
        int offset = (page * size >= totalBrands) ? Math.max(0, totalBrands - size) : page * size;

        List<Brand> brands = brandRepository.findFilteredBrands(
                reliability, isActive, startDate, endDate, size, offset, sortField, sortOrder);

        Map<String, Object> response = new HashMap<>();
        response.put("content", brands);
        response.put("total", totalBrands);
        response.put("page", page);
        response.put("size", size);

        return response;
    }

    @Transactional(readOnly = true)
    public Optional<Brand> getBrandById(Long id) {
        return brandRepository.findById(id);
    }

    @Transactional
    public void updateBrand(Long id, Brand brand) {
        Brand existingBrand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("❌ Marca con ID " + id + " no encontrada."));

        if (brand.getName() != null && !brand.getName().equals(existingBrand.getName())) {
            if (brandRepository.existsByName(brand.getName())) {
                throw new BadRequestException("❌ La marca '" + brand.getName() + "' ya existe.");
            }
            existingBrand.setName(brand.getName());
        }

        if (brand.getReliability() != null) {
            existingBrand.setReliability(brand.getReliability());
        }

        if (brand.getLogoUrl() != null) {
            existingBrand.setLogoUrl(brand.getLogoUrl());
        }
        brandRepository.save(existingBrand);
    }

    @Transactional
    public void deleteBrand(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new ResourceNotFoundException("❌ Marca con ID " + id + " no encontrada.");
        }
        brandRepository.delete(id);
    }
}
