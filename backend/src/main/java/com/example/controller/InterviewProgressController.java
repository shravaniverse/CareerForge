
package com.example.aiml.controller;

import com.example.aiml.entity.InterviewProgress;
import com.example.aiml.entity.User;
import com.example.aiml.repository.UserRepository;
import com.example.aiml.service.InterviewProgressService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview-progress")
public class InterviewProgressController {

    private final InterviewProgressService service;
    private final UserRepository userRepository;

    public InterviewProgressController(
            InterviewProgressService service,
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
    public List<InterviewProgress> getProgress(
            Authentication authentication) {
        return service.getProgress(getLoggedInUserId(authentication));
    }

    @PutMapping("/{questionIndex}")
    public InterviewProgress saveProgress(
            @PathVariable Integer questionIndex,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        Long userId = getLoggedInUserId(authentication);

        if (questionIndex == null || questionIndex < 0 || questionIndex >= 6) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid question index");
        }

        Object answerValue = request.get("answer");
        Object completedValue = request.get("completed");

        if (!(answerValue instanceof String)
                || !(completedValue instanceof Boolean)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Answer and completed values are required");
        }

        return service.saveProgress(
            userId,
            questionIndex,
            (String) answerValue,
            (Boolean) completedValue
        );
    }

    @DeleteMapping
    public Map<String, String> resetProgress(
            Authentication authentication) {
        service.resetProgress(getLoggedInUserId(authentication));
        return Map.of("message", "Interview progress reset successfully");
    }
}
