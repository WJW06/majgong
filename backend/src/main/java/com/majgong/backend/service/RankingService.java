package com.majgong.backend.service;

import com.majgong.backend.dto.ranking.RankingEntryDto;
import com.majgong.backend.entity.User;
import com.majgong.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RankingService {

    private final UserRepository userRepository;

    public List<RankingEntryDto> getRankingList() {
        List<User> topUsers = userRepository.findTop100ByOrderByTotalScoreDesc();
        List<RankingEntryDto> result = new ArrayList<>();
        
        int currentRank = 1;
        int previousScore = -1;
        int rankOffset = 0;

        // 공동 순위 부여 로직 (동일 점수는 같은 순위)
        for (int i = 0; i < topUsers.size(); i++) {
            User user = topUsers.get(i);
            
            if (i > 0) {
                if (user.getTotalScore() == previousScore) {
                    rankOffset++;
                } else {
                    currentRank += rankOffset + 1;
                    rankOffset = 0;
                }
            }
            
            RankingEntryDto dto = RankingEntryDto.builder()
                    .rank(currentRank)
                    .userId(user.getId())
                    .name(user.getName())
                    .grade(user.getGrade())
                    .totalScore(user.getTotalScore())
                    .build();
            
            result.add(dto);
            previousScore = user.getTotalScore();
        }

        return result;
    }
}
