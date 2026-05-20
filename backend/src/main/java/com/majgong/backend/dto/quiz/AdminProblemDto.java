package com.majgong.backend.dto.quiz;

import com.majgong.backend.entity.Difficulty;
import com.majgong.backend.entity.ProblemFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProblemDto {
    private Long id;
    private String question;
    private List<String> options;
    private String answer;
    private ProblemFormat format;
    private Difficulty difficulty;
    private String imageUrl;
}
