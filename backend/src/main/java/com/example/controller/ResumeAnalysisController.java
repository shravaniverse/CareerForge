package com.example.aiml.controller;
import com.example.aiml.entity.Resume;
import com.example.aiml.repository.ResumeRepository;
import com.example.aiml.service.ResumeAnalysisService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/resumes")
public class ResumeAnalysisController {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisService resumeAnalysisService;

    public ResumeAnalysisController(
            ResumeRepository resumeRepository,
            ResumeAnalysisService resumeAnalysisService) {
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisService = resumeAnalysisService;
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<?> analyzeResume(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        Optional<Resume> result = resumeRepository.findById(id);

        if (result.isEmpty()
                || !result.get().getUserEmail()
                .equals(authentication.getName())) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Resume not found"));
        }

        String jobRole = request.get("jobRole");
        String jobDescription = request.get("jobDescription");

        if (jobRole == null || jobRole.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please select a job role"));
        }

        Resume resume = result.get();

        try {
            Map<String, Object> analysis =
                    resumeAnalysisService.analyzeResume(
                            resume.getFilePath(),
                            resume.getFileName(),
                            jobRole,
                            jobDescription == null ? "" : jobDescription
                    );

            analysis.put("resumeId", resume.getId());

            return ResponseEntity.ok(analysis);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    "Could not analyze the resume. Please check the PDF and try again."
            ));
        }
    }
}
