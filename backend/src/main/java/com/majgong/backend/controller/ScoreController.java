package com.majgong.backend.controller;

import com.majgong.backend.dto.quiz.ScoreSubmitRequest;
import com.majgong.backend.dto.quiz.ScoreSubmitResponse;
import com.majgong.backend.service.ScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @PostMapping
    public ResponseEntity<ScoreSubmitResponse> submitScore(@RequestBody ScoreSubmitRequest request, Authentication authentication) {
        String email = authentication.getName(); // Depending on JWT configuration, this might be the email
        return ResponseEntity.ok(scoreService.submitScore(email, request));
    }
}
