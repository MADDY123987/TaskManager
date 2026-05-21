package com.taskmanager.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDTOs {

    @Data
    public static class SignupRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data @lombok.Builder @lombok.AllArgsConstructor @lombok.NoArgsConstructor
    public static class AuthResponse {
        private String token;
        private String type = "Bearer";
        private Long userId;
        private String name;
        private String email;
    }

    @Data @lombok.Builder @lombok.AllArgsConstructor @lombok.NoArgsConstructor
    public static class UserDTO {
        private Long id;
        private String name;
        private String email;
    }
}
