package com.example.aiml.controller;

import com.example.aiml.entity.Resume;
import com.example.aiml.repository.ResumeRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeRepository resumeRepository;

    public ResumeController(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please select a PDF file"));
        }

        String originalName = file.getOriginalFilename();

        if (!"application/pdf".equalsIgnoreCase(file.getContentType())
                || originalName == null
                || !originalName.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Only PDF files are allowed"));
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Maximum file size is 10 MB"));
        }

        try {
            Path uploadDir = Paths.get("uploads").toAbsolutePath();
            Files.createDirectories(uploadDir);

            String storedName = UUID.randomUUID() + ".pdf";
            Path destination = uploadDir.resolve(storedName);

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            Resume resume = new Resume();
            resume.setFileName(
                    Paths.get(originalName).getFileName().toString()
            );
            resume.setFilePath(destination.toString());
            resume.setUserEmail(authentication.getName());
            resume.setUploadedAt(LocalDateTime.now());

            Resume saved = resumeRepository.save(resume);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Resume uploaded successfully",
                    "id", saved.getId(),
                    "fileName", saved.getFileName(),
                    "uploadedAt", saved.getUploadedAt().toString()
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Could not save the resume"));
        }
    }

    @GetMapping
    public List<Resume> getMyResumes(Authentication authentication) {
        return resumeRepository.findByUserEmail(authentication.getName());
    }
}
