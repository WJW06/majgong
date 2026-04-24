package com.majgong.backend.security;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        String token = jwtProvider.generateToken(authentication);
        
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .path("/")
                .maxAge(60 * 60 * 24)
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());

        // Redirect back to frontend
        String targetUrl = UriComponentsBuilder.fromUriString("/oauth2/callback")
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
