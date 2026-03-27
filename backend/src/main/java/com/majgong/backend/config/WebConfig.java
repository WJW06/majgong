package com.majgong.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serving the backend/source folder as the /source/** path
        // Refers to the source folder in the project root when running locally
        registry.addResourceHandler("/source/**")
                .addResourceLocations("file:source/");
    }
}
