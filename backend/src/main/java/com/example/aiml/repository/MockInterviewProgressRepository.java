package com.example.aiml.repository;

import com.example.aiml.entity.MockInterviewProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MockInterviewProgressRepository
        extends JpaRepository<MockInterviewProgress, Long> {

    List<MockInterviewProgress> findByUserId(Long userId);

    Optional<MockInterviewProgress>
        findByUserIdAndQuestionIndex(
            Long userId,
            Integer questionIndex
        );

    long countByUserIdAndCompletedTrue(Long userId);

    void deleteByUserId(Long userId);
}