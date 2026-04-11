package com.majgong.backend.controller;

import com.majgong.backend.dto.AuthDto;
import com.majgong.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

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
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest request, HttpServletResponse httpServletResponse) {
        try {
            AuthDto.LoginResult result = authService.login(request);

            ResponseCookie cookie = ResponseCookie.from("accessToken", result.getToken())
                    .httpOnly(true)
                    .path("/")
                    .maxAge(60 * 60 * 24)
                    .build();
            httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            AuthDto.LoginResponse response = AuthDto.LoginResponse.builder()
                    .user(result.getUser())
                    .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse httpServletResponse) {
        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0) // Expire immediately
                .build();
        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Collections.singletonMap("message", "로그아웃 되었습니다."));
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
