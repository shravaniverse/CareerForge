
package com.example.aiml.service;

import com.example.aiml.entity.InterviewProgress;
import com.example.aiml.repository.InterviewProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InterviewProgressService {

    private final InterviewProgressRepository repository;

    public InterviewProgressService(
            InterviewProgressRepository repository) {
        this.repository = repository;
    }

    public List<InterviewProgress> getProgress(Long userId) {
        return repository.findByUserId(userId);
    }

    @Transactional
    public InterviewProgress saveProgress(
            Long userId,
            Integer questionIndex,
            String answer,
            boolean completed) {

        InterviewProgress progress = repository
            .findByUserIdAndQuestionIndex(userId, questionIndex)
            .orElseGet(() -> {
                InterviewProgress item = new InterviewProgress();
                item.setUserId(userId);
                item.setQuestionIndex(questionIndex);
                return item;
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
