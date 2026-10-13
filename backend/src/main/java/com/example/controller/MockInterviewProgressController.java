package com.example.aiml.controller;

import com.example.aiml.entity.MockInterviewProgress;
import com.example.aiml.entity.User;
import com.example.aiml.repository.UserRepository;
import com.example.aiml.service.MockInterviewProgressService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mock-interview")
public class MockInterviewProgressController {

    private final MockInterviewProgressService service;
    private final UserRepository userRepository;

    public MockInterviewProgressController(
            MockInterviewProgressService service,
            UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    private Long getLoggedInUserId(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Please log in"
            );
        }

        User user = userRepository.findByEmail(
            authentication.getName()
        );

        if (user == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "User not found"
            );
        }

        return user.getId();
    }

    @GetMapping
    public List<MockInterviewProgress> getProgress(
            Authentication authentication) {

        Long userId = getLoggedInUserId(authentication);
        return service.getProgress(userId);
    }

    @GetMapping("/summary")
    public Map<String, Long> getSummary(
            Authentication authentication) {

        Long userId = getLoggedInUserId(authentication);

        return Map.of(
            "completedCount",
            service.getCompletedCount(userId)
        );
    }

    @PutMapping("/{questionIndex}")
    public MockInterviewProgress saveProgress(
            @PathVariable Integer questionIndex,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        Long userId = getLoggedInUserId(authentication);

        if (questionIndex == null
                || questionIndex < 0
                || questionIndex >= 6) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid question index"
            );
        }

        Object answerValue = request.get("answer");
        Object completedValue = request.get("completed");

        if (!(answerValue instanceof String)
                || !(completedValue instanceof Boolean)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Answer and completed values are required"
            );
        }

        String answer = (String) answerValue;
        boolean completed = (Boolean) completedValue;

        if (answer.length() > 5000) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Answer must not exceed 5000 characters"
            );
        }

        if (completed && answer.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Enter an answer before marking it attempted"
            );
        }

        return service.saveProgress(
            userId,
            questionIndex,
            answer,
            completed
        );
    }

    @DeleteMapping
    public Map<String, String> resetProgress(
            Authentication authentication) {

        Long userId = getLoggedInUserId(authentication);
        service.resetProgress(userId);

        return Map.of("message", "Interview progress reset");
    }
}