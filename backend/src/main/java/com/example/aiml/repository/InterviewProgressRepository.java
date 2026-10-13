
package com.example.aiml.repository;

import com.example.aiml.entity.InterviewProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InterviewProgressRepository
        extends JpaRepository<InterviewProgress, Long> {

    List<InterviewProgress> findByUserId(Long userId);

    Optional<InterviewProgress> findByUserIdAndQuestionIndex(
        Long userId,
        Integer questionIndex
    );

    void deleteByUserId(Long userId);
}
