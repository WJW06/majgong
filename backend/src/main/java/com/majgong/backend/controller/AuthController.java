package com.majgong.backend.controller;

import com.majgong.backend.dto.AuthDto;
import com.majgong.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDto.RegisterRequest request) {
        try {
            AuthDto.RegisterResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest request) {
        try {
            AuthDto.LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    /**
     * 프론트엔드에서 /api/v1/auth/google 클릭 시
     * Spring Security OAuth2 인가 URL로 리다이렉트
     */
    @GetMapping("/google")
    public void googleLogin(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/google");
    }

    /**
     * 프론트엔드에서 /api/v1/auth/naver 클릭 시
     * Spring Security OAuth2 인가 URL로 리다이렉트
     */
    @GetMapping("/naver")
    public void naverLogin(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/naver");
    }
}
