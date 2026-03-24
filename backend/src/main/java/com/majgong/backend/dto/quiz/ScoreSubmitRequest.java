package com.majgong.backend.dto.quiz;

import com.majgong.backend.entity.QuizType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScoreSubmitRequest {
    private Long quizId;
    private QuizType type;
    private int totalCount;
    private int correctCount;
    private int wrongCount;
    private int score;
}
