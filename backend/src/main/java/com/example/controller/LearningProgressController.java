
package com.example.aiml.controller;

import com.example.aiml.entity.LearningProgress;
import com.example.aiml.entity.User;
import com.example.aiml.repository.UserRepository;
import com.example.aiml.service.LearningProgressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learning-progress")
public class LearningProgressController {

    private final LearningProgressService service;
    private final UserRepository userRepository;

    public LearningProgressController(
            LearningProgressService service,
            UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    private Long getLoggedInUserId(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Please log in");
        }

        User user = userRepository.findByEmail(authentication.getName());

        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "User not found");
        }

        return user.getId();
    }

    @GetMapping
    public List<LearningProgress> getProgress(
            Authentication authentication) {
        Long userId = getLoggedInUserId(authentication);
        return service.getProgress(userId);
    }

    @GetMapping("/summary")
    public Map<String, Long> getSummary(
            Authentication authentication) {
        Long userId = getLoggedInUserId(authentication);

        return Map.of(
                "completedCount", service.getCompletedCount(userId)
        );
    }

    @PutMapping("/{topicId}")
    public LearningProgress updateProgress(
            @PathVariable String topicId,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {

        Long userId = getLoggedInUserId(authentication);
        Boolean completed = request.get("completed");

        if (topicId.isBlank() || topicId.length() > 200
                || completed == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A valid topicId and completed value are required");
        }

        return service.updateProgress(userId, topicId, completed);
    }
}
