package com.majgong.backend.controller;

import com.majgong.backend.entity.Difficulty;
import com.majgong.backend.dto.quiz.ProblemRangeDto;
import com.majgong.backend.dto.quiz.QuizStartRequest;
import com.majgong.backend.dto.quiz.QuizStartResponse;
import com.majgong.backend.dto.quiz.SubjectDto;
import com.majgong.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final QuizService quizService;

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectDto>> getSubjects() {
        return ResponseEntity.ok(quizService.getAllSubjects());
    }

    @GetMapping("/ranges")
    public ResponseEntity<List<ProblemRangeDto>> getRanges(@RequestParam("subject") Long subjectId) {
        return ResponseEntity.ok(quizService.getRangesBySubject(subjectId));
    }

    @PostMapping("/quiz")
    public ResponseEntity<QuizStartResponse> startQuiz(@RequestBody QuizStartRequest request) {
        return ResponseEntity.ok(quizService.generateQuiz(request));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getCount(@RequestParam("rangeId") Long rangeId, 
                                         @RequestParam("difficulty") Difficulty difficulty) {
        return ResponseEntity.ok(quizService.getProblemCount(rangeId, difficulty));
    }
}
