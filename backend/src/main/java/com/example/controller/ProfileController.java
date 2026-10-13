
package com.example.aiml.controller;

import com.example.aiml.dto.ProfileUpdateRequest;
import com.example.aiml.entity.User;
import com.example.aiml.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;

    public ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(
            Authentication authentication) {

        User user = userRepository.findByEmail(
                authentication.getName());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone() == null ? "" : user.getPhone(),
                "college", user.getCollege() == null ? "" : user.getCollege(),
                "degree", user.getDegree() == null ? "" : user.getDegree(),
                "graduationYear", user.getGraduationYear() == null
                        ? 0 : user.getGraduationYear()
        ));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {

        User user = userRepository.findByEmail(
                authentication.getName());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        if (request.getName() == null
                || request.getName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name is required"));
        }

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setCollege(request.getCollege());
        user.setDegree(request.getDegree());
        user.setGraduationYear(request.getGraduationYear());

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "name", user.getName(),
                "email", user.getEmail()
        ));
    }
}
