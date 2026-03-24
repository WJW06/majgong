package com.majgong.backend.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizProblemDto {
    private Long id;
    private String question;
    private List<String> options;
    private String answer; // Can be null if it's an EXAM
}
