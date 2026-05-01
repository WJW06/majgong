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

    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("subjectFolder") String subjectFolder,
            @RequestParam("rangeFolder") String rangeFolder,
            Principal principal) {
        if (principal == null || !"majgong@manager.com".equals(principal.getName())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
        
        try {
            String dirPath = "source/" + subjectFolder + "/" + rangeFolder;
            java.io.File dir = new java.io.File(dirPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            String originalFileName = file.getOriginalFilename();
            // Optional: sanitize filename or add timestamp to avoid collisions
            String fileName = System.currentTimeMillis() + "_" + originalFileName;
            
            java.nio.file.Path filePath = java.nio.file.Paths.get(dirPath, fileName);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            return ResponseEntity.ok("/source/" + subjectFolder + "/" + rangeFolder + "/" + fileName);
        } catch (java.io.IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed");
        }
    }
}
