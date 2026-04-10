package com.majgong.backend.dto.ranking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingEntryDto {
    private int rank;
    private Long userId;
    private String name;
    private String grade;
    private int totalScore;
}
