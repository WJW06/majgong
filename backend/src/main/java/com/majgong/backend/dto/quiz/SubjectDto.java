package com.majgong.backend.dto.quiz;

import com.majgong.backend.entity.Subject;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDto {
    private Long id;
    private String name;

    public static SubjectDto from(Subject subject) {
        return new SubjectDto(subject.getId(), subject.getName());
    }
}
