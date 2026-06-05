package com.majgong.backend.service;

import com.majgong.backend.dto.AuthDto;
import com.majgong.backend.entity.LoginType;
import com.majgong.backend.entity.User;
import com.majgong.backend.repository.UserRepository;
import com.majgong.backend.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public AuthDto.RegisterResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        if (userRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .loginType(LoginType.LOCAL)
                .grade("입문")
                .totalScore(0)
                .role("ROLE_USER")
                .build();

        userRepository.save(user);

        return AuthDto.RegisterResponse.builder()
                .message("회원가입이 완료되었습니다.")
                .build();
    }

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public AuthDto.LoginResult login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        // 잠금 시간이 설정되어 있고 잠금 기간이 만료된 경우 실패 횟수 초기화
        if (user.getLockTime() != null && !user.isLocked()) {
            user.resetLoginFailCount();
            userRepository.save(user);
        }

        if (user.isLocked()) {
            java.time.LocalDateTime unlockTime = user.getLockTime().plusHours(1);
            java.time.Duration remaining = java.time.Duration.between(java.time.LocalDateTime.now(), unlockTime);
            long minutes = remaining.toMinutes();
            long seconds = remaining.getSeconds() % 60;
            throw new IllegalArgumentException(String.format("비밀번호 5회 이상 오류로 인해 로그인이 1시간 동안 제한됩니다. (남은 시간: %d분 %d초)", minutes, seconds));
        }

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.incrementLoginFailCount();
            if (user.getLoginFailCount() >= 5) {
                user.lock(java.time.LocalDateTime.now());
                userRepository.save(user);
                throw new IllegalArgumentException("비밀번호 5회 이상 오류로 인해 로그인이 1시간 동안 제한됩니다.");
            } else {
                userRepository.save(user);
                throw new IllegalArgumentException(String.format("이메일 또는 비밀번호가 올바르지 않습니다. (실패 횟수: %d/5)", user.getLoginFailCount()));
            }
        }

        user.resetLoginFailCount();
        userRepository.save(user);

        String token = jwtProvider.generateToken(user.getEmail());

        AuthDto.UserInfo userInfo = AuthDto.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .grade(user.getGrade())
                .totalScore(user.getTotalScore())
                .build();

        return AuthDto.LoginResult.builder()
                .token(token)
                .user(userInfo)
                .build();
    }
    @Transactional(readOnly = true)
    public void checkNickname(String name) {
        if (userRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }
    }
}
