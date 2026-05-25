package com.taskmanager.auth.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

public class AuthDTOs {

    // ── Step 1: Register → sends OTP ──────────────────────────────────────
    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
    }

    // ── Step 2: Verify OTP + set password → creates account + JWT ─────────
    @Data
    public static class VerifyRegistrationRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100)
        private String name;          // ← ADD THIS LINE

        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "OTP is required")
        @Size(min = 4, max = 4, message = "OTP must be 4 digits")
        private String otp;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    // ── Login ──────────────────────────────────────────────────────────────
    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    // ── Forgot Password → sends OTP ───────────────────────────────────────
    @Data
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;
    }

    // ── Reset Password (OTP + new password) ───────────────────────────────
    @Data
    public static class ResetPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "OTP is required")
        @Size(min = 4, max = 4, message = "OTP must be 4 digits")
        private String otp;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;
    }

    // ── Responses ─────────────────────────────────────────────────────────
    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class AuthResponse {
        private String token;
        private String type;
        private Long userId;
        private String name;
        private String email;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class MessageResponse {
        private String message;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class UserDTO {
        private Long id;
        private String name;
        private String email;
    }
}