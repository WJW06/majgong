package com.majgong.backend.controller;

import com.majgong.backend.dto.ranking.RankingEntryDto;
import com.majgong.backend.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping
    public ResponseEntity<List<RankingEntryDto>> getRankingList() {
        return ResponseEntity.ok(rankingService.getRankingList());
    }
}
