package com.comparathor.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Role {
    private Long id;
    private String name;
    private String description;

    public boolean matches(String roleName) {
        return this.name.equalsIgnoreCase(roleName);
    }
}
