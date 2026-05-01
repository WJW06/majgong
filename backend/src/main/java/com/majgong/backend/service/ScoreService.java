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
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class ScoreService {

    private final QuizScoreRepository quizScoreRepository;
    private final UserRepository userRepository;

    // 유저별 마지막 점수 제출 시간을 저장 (메모리 기반 Rate Limiting)
    private final ConcurrentHashMap<String, Long> lastSubmitTimeMap = new ConcurrentHashMap<>();

    public ScoreSubmitResponse submitScore(String userEmail, ScoreSubmitRequest request) {
        long currentTime = System.currentTimeMillis();
        Long lastSubmitTime = lastSubmitTimeMap.get(userEmail);

        // 다중 fetch (매크로/연속 클릭) 방지: 3초(3000ms) 이내의 연속 요청은 차단
        if (lastSubmitTime != null && (currentTime - lastSubmitTime) < 3000) {
            throw new RuntimeException("요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.");
        }
        lastSubmitTimeMap.put(userEmail, currentTime);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 클라이언트에서 보낸 점수 조작(console fetch 등)을 막기 위해 서버에서 점수를 재계산
        int total = Math.min(request.getTotalCount(), 50); // 최대 문제 수 제한
        int correct = Math.min(Math.max(request.getCorrectCount(), 0), total); // 정답 수는 총 문제 수를 넘을 수 없음
        int wrong = Math.min(Math.max(request.getWrongCount(), 0), total - correct);

        int calculatedScore = 0;
        if (request.getType() == com.majgong.backend.entity.QuizType.PRACTICE) {
            calculatedScore = correct * 1;
        } else if (request.getType() == com.majgong.backend.entity.QuizType.EXAM) {
            calculatedScore = (correct - wrong) * 5;
        }

        // 혹시나 계산된 점수가 음수가 될 경우 0으로 처리 (기획에 따라 다를 수 있으나 보통 음수 방지)
        calculatedScore = Math.max(calculatedScore, 0);

        QuizScore score = new QuizScore();
        score.setUser(user);
        score.setQuizType(request.getType());
        score.setTotalCount(total);
        score.setCorrectCount(correct);
        score.setWrongCount(wrong);
        score.setScore(calculatedScore); // 검증된 점수 사용

        QuizScore saved = quizScoreRepository.save(score);

        // 점수 및 등급 업데이트 연동
        user.addScore(calculatedScore); // 검증된 점수 추가
        userRepository.save(user);

        return new ScoreSubmitResponse(saved.getId(), saved.getScore(), "점수가 저장되었습니다.");
    }
}
