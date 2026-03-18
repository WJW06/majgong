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
    public void register(AuthDto.RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .loginType(LoginType.LOCAL)
                .grade("UNRANKED") // Default grade
                .totalScore(0)
                .role("ROLE_USER")
                .build();

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AuthDto.TokenResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtProvider.generateToken(user.getEmail());

        return AuthDto.TokenResponse.builder()
                .accessToken(token)
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }
}
