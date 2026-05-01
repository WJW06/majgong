package com.majgong.backend.repository;

import com.majgong.backend.entity.Difficulty;
import com.majgong.backend.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    @Query("SELECT DISTINCT p FROM Problem p WHERE p.problemRange.id = :rangeId AND p.difficulty = :difficulty AND p.format = :format")
    List<Problem> findByProblemRangeIdAndDifficultyAndFormat(@Param("rangeId") Long rangeId, @Param("difficulty") Difficulty difficulty, @Param("format") com.majgong.backend.entity.ProblemFormat format);

    @Query("SELECT DISTINCT p FROM Problem p WHERE p.problemRange.id = :rangeId AND p.difficulty = :difficulty")
    List<Problem> findByProblemRangeIdAndDifficulty(@Param("rangeId") Long rangeId, @Param("difficulty") Difficulty difficulty);

    long countByProblemRangeIdAndDifficultyAndFormat(Long problemRangeId, Difficulty difficulty, com.majgong.backend.entity.ProblemFormat format);

    long countByProblemRangeIdAndDifficulty(Long problemRangeId, Difficulty difficulty);

    // Use LIKE to compare CLOB fields in Oracle to avoid ORA-00932
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Problem p WHERE p.question LIKE :question")
    boolean existsByQuestion(@Param("question") String question);
}
