package com.comparathor.model;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ComparisonProduct {
    private Long id;
    private Long comparisonId;
    private Long productId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
