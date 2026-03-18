package com.majgong.backend.security;

import com.majgong.backend.entity.LoginType;
import com.majgong.backend.entity.User;
import com.majgong.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = "";
        String name = "";
        LoginType loginType = provider.equals("google") ? LoginType.GOOGLE : LoginType.NAVER;

        if (provider.equals("google")) {
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
        } else if (provider.equals("naver")) {
            Map<String, Object> response = (Map<String, Object>) attributes.get("response");
            email = (String) response.get("email");
            name = (String) response.get("name");
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;

        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            // You might want to update name if it changed
        } else {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .loginType(loginType)
                    .grade("UNRANKED")
                    .totalScore(0)
                    .role("ROLE_USER")
                    .build();
            userRepository.save(user);
        }

        return new AppOAuth2User(user, attributes);
    }
}
