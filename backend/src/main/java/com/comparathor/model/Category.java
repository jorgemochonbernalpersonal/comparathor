package com.comparathor.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Category {
    private Long id;
    private String name;
    private String description;
    private String color;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
