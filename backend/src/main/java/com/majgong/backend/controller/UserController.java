package com.majgong.backend.controller;

import com.majgong.backend.dto.AuthDto;
import com.majgong.backend.entity.User;
import com.majgong.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401)
                    .body(Collections.singletonMap("message", "인증되지 않은 사용자입니다."));
        }

        // Since the email was extracted and saved from JwtAuthenticationFilter, getName() is the email.
        String email = authentication.getName();
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (!optionalUser.isPresent()) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("message", "사용자를 찾을 수 없습니다."));
        }

        User user = optionalUser.get();
        AuthDto.UserInfo userInfo = AuthDto.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .grade(user.getGrade())
                .totalScore(user.getTotalScore())
                .build();

        return ResponseEntity.ok(userInfo);
    }
}
