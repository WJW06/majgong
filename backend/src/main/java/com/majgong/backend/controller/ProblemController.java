package com.majgong.backend.controller;

import com.majgong.backend.entity.Difficulty;
import com.majgong.backend.dto.quiz.ProblemRangeDto;
import com.majgong.backend.dto.quiz.QuizStartRequest;
import com.majgong.backend.dto.quiz.QuizStartResponse;
import com.majgong.backend.dto.quiz.SubjectDto;
import com.majgong.backend.dto.quiz.CheckAnswerRequest;
import com.majgong.backend.dto.quiz.CheckAnswerResponse;
import com.majgong.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.majgong.backend.dto.quiz.ProblemCreateRequest;

import java.security.Principal;
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

    @PostMapping("/create")
    public ResponseEntity<Void> createProblem(@RequestBody ProblemCreateRequest request, Principal principal) {
        if (principal == null || !"majgong@manager.com".equals(principal.getName())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
        quizService.createProblem(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getCount(@RequestParam("rangeId") Long rangeId, 
                                         @RequestParam("difficulty") Difficulty difficulty,
                                         @RequestParam("format") com.majgong.backend.entity.ProblemFormat format) {
        return ResponseEntity.ok(quizService.getProblemCount(rangeId, difficulty, format));
    }

    @PostMapping("/check")
    public ResponseEntity<java.util.Map<String, Object>> checkAnswer(@RequestBody CheckAnswerRequest request) {
        System.out.println("checkAnswer called! ProblemId: " + request.getProblemId() + ", UserAnswer: " + request.getUserAnswer());
        CheckAnswerResponse response = quizService.checkAnswer(request);
        System.out.println("Result -> correct: " + response.getCorrect() + ", actualAnswer: " + response.getActualAnswer());
        
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("correct", response.getCorrect());
        map.put("actualAnswer", response.getActualAnswer());
        return ResponseEntity.ok(map);
    }
}
