package com.taskmanager.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Team Task Manager API")
                        .description("""
                                RESTful API for Team Task Management.
                                
                                **Auth:** POST /api/auth/signup or /api/auth/login to get a JWT,
                                then click 'Authorize' and enter: `Bearer <token>`
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Team Task Manager")
                                .email("admin@taskmanager.com")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT token obtained from /api/auth/login")));
    }
}
