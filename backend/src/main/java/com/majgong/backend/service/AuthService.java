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

    @Transactional(readOnly = true)
    public AuthDto.LoginResult login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

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
}
