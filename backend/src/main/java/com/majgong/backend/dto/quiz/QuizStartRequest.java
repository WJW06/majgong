package com.majgong.backend.dto.quiz;

import com.majgong.backend.entity.Difficulty;
import com.majgong.backend.entity.QuizType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizStartRequest {
    private Long subjectId;
    private Long rangeId;
    private Difficulty difficulty;
    private int count;
    private QuizType type;
    private com.majgong.backend.entity.ProblemFormat format;
}
