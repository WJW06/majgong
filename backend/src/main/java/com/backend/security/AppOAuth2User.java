package com.majgong.backend.security;

import org.springframework.security.oauth2.core.user.OAuth2User;

import com.majgong.backend.entity.User;

import java.util.Map;

public class AppOAuth2User extends AppUserDetails implements OAuth2User {

    private Map<String, Object> attributes;

    public AppOAuth2User(User user, Map<String, Object> attributes) {
        super(user);
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return getUser().getEmail();
    }
}
