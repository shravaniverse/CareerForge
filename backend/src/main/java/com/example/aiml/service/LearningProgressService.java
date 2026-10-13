
package com.example.aiml.service;

import com.example.aiml.entity.LearningProgress;
import com.example.aiml.repository.LearningProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LearningProgressService {

    private final LearningProgressRepository repository;

    public LearningProgressService(
            LearningProgressRepository repository) {
        this.repository = repository;
    }

    public List<LearningProgress> getProgress(Long userId) {
        return repository.findByUserId(userId);
    }

    public long getCompletedCount(Long userId) {
        return repository.countByUserIdAndCompletedTrue(userId);
    }

    @Transactional
    public LearningProgress updateProgress(
            Long userId, String topicId, boolean completed) {

        LearningProgress progress = repository
                .findByUserIdAndTopicId(userId, topicId)
                .orElseGet(() -> {
                    LearningProgress newProgress =
                            new LearningProgress();
                    newProgress.setUserId(userId);
                    newProgress.setTopicId(topicId);
                    return newProgress;
                });

        progress.setCompleted(completed);

        return repository.save(progress);
    }
}
