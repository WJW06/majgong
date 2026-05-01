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

    @Transactional
    public void createProblem(ProblemCreateRequest request) {
        com.majgong.backend.entity.ProblemRange range = problemRangeRepository.findById(request.getRangeId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Range ID"));

        if (problemRepository.existsByQuestion(request.getQuestion())) {
            throw new IllegalArgumentException("A problem with this question already exists.");
        }

        Problem problem = new Problem();
        problem.setQuestion(request.getQuestion());
        problem.setDifficulty(request.getDifficulty());
        problem.setFormat(request.getFormat());
        problem.setImageUrl(request.getImageUrl());
        problem.setAnswer(request.getAnswer());
        problem.setProblemRange(range);

        if (request.getFormat() == com.majgong.backend.entity.ProblemFormat.MULTIPLE_CHOICE && request.getOptions() != null) {
            for (String optText : request.getOptions()) {
                ProblemOption option = new ProblemOption();
                option.setText(optText);
                option.setProblem(problem);
                problem.getOptions().add(option);
            }
        }
        problemRepository.save(problem);
    }

    public List<ProblemRangeDto> getRangesBySubject(Long subjectId) {
        return problemRangeRepository.findBySubjectId(subjectId)
                .stream()
                .map(ProblemRangeDto::from)
                .collect(Collectors.toList());
    }

    public QuizStartResponse generateQuiz(QuizStartRequest request) {
        List<Problem> problems;
        boolean isMixedFormat = request.getFormat() == com.majgong.backend.entity.ProblemFormat.MIXED;
        boolean isMixedDifficulty = request.getDifficulty() == Difficulty.MIXED;

        if (isMixedDifficulty && isMixedFormat) {
            problems = problemRepository.findByProblemRangeId(request.getRangeId());
        } else if (isMixedDifficulty) {
            problems = problemRepository.findByProblemRangeIdAndFormat(
                    request.getRangeId(),
                    request.getFormat()
            );
        } else if (isMixedFormat) {
            problems = problemRepository.findByProblemRangeIdAndDifficulty(
                    request.getRangeId(),
                    request.getDifficulty()
            );
        } else {
            problems = problemRepository.findByProblemRangeIdAndDifficultyAndFormat(
                    request.getRangeId(),
                    request.getDifficulty(),
                    request.getFormat()
            );
        }
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
        boolean isMixedFormat = format == com.majgong.backend.entity.ProblemFormat.MIXED;
        boolean isMixedDifficulty = difficulty == Difficulty.MIXED;

        if (isMixedDifficulty && isMixedFormat) {
            return problemRepository.countByProblemRangeId(rangeId);
        } else if (isMixedDifficulty) {
            return problemRepository.countByProblemRangeIdAndFormat(rangeId, format);
        } else if (isMixedFormat) {
            return problemRepository.countByProblemRangeIdAndDifficulty(rangeId, difficulty);
        }
        return problemRepository.countByProblemRangeIdAndDifficultyAndFormat(rangeId, difficulty, format);
    }
}
