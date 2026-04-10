package com.majgong.backend.service;

import com.majgong.backend.dto.quiz.ScoreSubmitRequest;
import com.majgong.backend.dto.quiz.ScoreSubmitResponse;
import com.majgong.backend.entity.QuizScore;
import com.majgong.backend.entity.User;
import com.majgong.backend.repository.QuizScoreRepository;
import com.majgong.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ScoreService {

    private final QuizScoreRepository quizScoreRepository;
    private final UserRepository userRepository;

    public ScoreSubmitResponse submitScore(String userEmail, ScoreSubmitRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        QuizScore score = new QuizScore();
        score.setUser(user);
        score.setQuizType(request.getType());
        score.setTotalCount(request.getTotalCount());
        score.setCorrectCount(request.getCorrectCount());
        score.setWrongCount(request.getWrongCount());
        score.setScore(request.getScore());
        
        QuizScore saved = quizScoreRepository.save(score);

        // 점수 및 등급 업데이트 연동
        user.addScore(request.getScore());
        userRepository.save(user);

        return new ScoreSubmitResponse(saved.getId(), saved.getScore(), "점수가 저장되었습니다.");
    }
}
