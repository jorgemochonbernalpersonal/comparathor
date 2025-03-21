package com.comparathor.model;

import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User {
    private Long id;
    private String name;
    private String email;
    private String password;
    private Role role;
    private Long roleId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<Long> comparisonIds = new ArrayList<>();
    private List<Long> ratingIds = new ArrayList<>();
}
