package com.example.aiml.service;

import com.example.aiml.entity.MockInterviewProgress;
import com.example.aiml.repository.MockInterviewProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MockInterviewProgressService {

    private final MockInterviewProgressRepository repository;

    public MockInterviewProgressService(
            MockInterviewProgressRepository repository) {
        this.repository = repository;
    }

    public List<MockInterviewProgress> getProgress(Long userId) {
        return repository.findByUserId(userId);
    }

    public long getCompletedCount(Long userId) {
        return repository.countByUserIdAndCompletedTrue(userId);
    }

    @Transactional
    public MockInterviewProgress saveProgress(
            Long userId,
            Integer questionIndex,
            String answer,
            boolean completed) {

        MockInterviewProgress progress = repository
            .findByUserIdAndQuestionIndex(userId, questionIndex)
            .orElseGet(() -> {
                MockInterviewProgress newProgress =
                    new MockInterviewProgress();
                newProgress.setUserId(userId);
                newProgress.setQuestionIndex(questionIndex);
                return newProgress;
            });

        progress.setAnswer(answer);
        progress.setCompleted(completed);

        return repository.save(progress);
    }

    @Transactional
    public void resetProgress(Long userId) {
        repository.deleteByUserId(userId);
    }
}