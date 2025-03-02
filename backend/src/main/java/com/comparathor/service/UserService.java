package com.comparathor.service;

import com.comparathor.exception.ResourceNotFoundException;
import com.comparathor.model.User;
import com.comparathor.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFilteredUsers(String roleName, String searchTerm, LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        int offset = page * size;
        List<User> users = userRepository.findFilteredUsers(roleName, searchTerm, startDate, endDate, offset, size);
        int totalUsers = userRepository.countFilteredUsers(roleName, searchTerm, startDate, endDate);

        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", totalUsers);
        response.put("content", users);
        return response;
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new ResourceNotFoundException("Usuario no encontrado con ID: " + id);
        }
        return user;
    }
}
