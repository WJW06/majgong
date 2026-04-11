package com.majgong.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        private String email;
        private String password;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginResult { // Internal use
        private String token;
        private UserInfo user;
    }

    /** 프론트엔드가 기대하는 로그인 응답: { user } */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginResponse {
        private UserInfo user;
    }

    /** 프론트엔드 User 인터페이스와 일치 */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String grade;
        private int totalScore;
    }

    /** 프론트엔드가 기대하는 회원가입 응답: { message } */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterResponse {
        private String message;
    }
}
