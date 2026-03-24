package com.majgong.backend.repository;

import com.majgong.backend.entity.QuizScore;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizScoreRepository extends JpaRepository<QuizScore, Long> {
}
