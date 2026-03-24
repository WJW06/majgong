package com.majgong.backend.repository;

import com.majgong.backend.entity.ProblemRange;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProblemRangeRepository extends JpaRepository<ProblemRange, Long> {
    List<ProblemRange> findBySubjectId(Long subjectId);
    List<ProblemRange> findByNameAndSubjectId(String name, Long subjectId);
}
