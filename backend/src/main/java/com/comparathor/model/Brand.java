package com.comparathor.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Brand {
    private Long id;
    private String name;
    private String logoUrl;
    private Integer reliability;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
