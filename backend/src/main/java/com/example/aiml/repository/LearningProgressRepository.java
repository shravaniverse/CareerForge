
package com.example.aiml.repository;

import com.example.aiml.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LearningProgressRepository
        extends JpaRepository<LearningProgress, Long> {

    List<LearningProgress> findByUserId(Long userId);

    Optional<LearningProgress> findByUserIdAndTopicId(
            Long userId, String topicId);

    long countByUserIdAndCompletedTrue(Long userId);
}
