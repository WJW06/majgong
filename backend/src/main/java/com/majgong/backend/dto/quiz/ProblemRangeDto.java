package com.majgong.backend.dto.quiz;

import com.majgong.backend.entity.ProblemRange;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProblemRangeDto {
    private Long id;
    private String name;
    private String folderName;

    public static ProblemRangeDto from(ProblemRange range) {
        return new ProblemRangeDto(range.getId(), range.getName(), range.getFolderName());
    }
}
