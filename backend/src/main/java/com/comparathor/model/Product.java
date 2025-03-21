package com.comparathor.model;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Product {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private Double price;
    private Integer stock;
    private String description;
    private String model;
    private String imageUrl;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
