package com.majgong.backend.service;

import com.majgong.backend.dto.quiz.*;
import com.majgong.backend.entity.Problem;
import com.majgong.backend.entity.ProblemOption;
import com.majgong.backend.entity.Difficulty;
import com.majgong.backend.repository.ProblemRangeRepository;
import com.majgong.backend.repository.ProblemRepository;
import com.majgong.backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizService {

    private final SubjectRepository subjectRepository;
    private final ProblemRangeRepository problemRangeRepository;
    private final ProblemRepository problemRepository;

    public List<SubjectDto> getAllSubjects() {
        return subjectRepository.findAll()
                .stream()
                .map(SubjectDto::from)
                .collect(Collectors.toList());
    }

    public List<ProblemRangeDto> getRangesBySubject(Long subjectId) {
        return problemRangeRepository.findBySubjectId(subjectId)
                .stream()
                .map(ProblemRangeDto::from)
                .collect(Collectors.toList());
    }

    public QuizStartResponse generateQuiz(QuizStartRequest request) {
        List<Problem> problems = problemRepository.findByProblemRangeIdAndDifficultyAndFormat(
                request.getRangeId(),
                request.getDifficulty(),
                request.getFormat()
        );
        Collections.shuffle(problems);
        if (problems.size() > request.getCount()) {
            problems = problems.subList(0, request.getCount());
        }

        List<QuizProblemDto> problemDtos = problems.stream().map(p -> {
            List<String> options = p.getOptions().stream()
                    .map(ProblemOption::getText)
                    .collect(Collectors.toList());

            // String answer = request.getType() == QuizType.PRACTICE ? p.getAnswer() : null;
            String answer = p.getAnswer();

            return new QuizProblemDto(p.getId(), p.getQuestion(), options, answer, p.getFormat(), p.getImageUrl());
        }).collect(Collectors.toList());

        // For simplicity, we use the timestamp or a random value as a pseudo quiz ID since we don't persist quiz sessions yet.
        long pseudoQuizId = System.currentTimeMillis();

        return new QuizStartResponse(pseudoQuizId, problemDtos);
    }

    public long getProblemCount(Long rangeId, Difficulty difficulty, com.majgong.backend.entity.ProblemFormat format) {
        return problemRepository.countByProblemRangeIdAndDifficultyAndFormat(rangeId, difficulty, format);
    }
}
