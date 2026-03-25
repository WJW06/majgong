package com.majgong.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // backend/source 폴더를 /source/** 경로로 서빙
        // 로컬 실행 시 프로젝트 루트의 source 폴더를 참조합니다.
        registry.addResourceHandler("/source/**")
                .addResourceLocations("file:source/");
    }
}
