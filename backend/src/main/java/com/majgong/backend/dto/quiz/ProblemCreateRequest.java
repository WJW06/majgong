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
public class ProblemCreateRequest {
    private Long subjectId;
    private Long rangeId;
    private ProblemFormat format;
    private Difficulty difficulty;
    private String imageUrl;
    private String question;
    private String answer;
    private List<String> options;
}
