package com.taskmanager.auth;



import com.taskmanager.auth.dto.AuthDTOs.*;
import com.taskmanager.common.ApiResponse;
import com.taskmanager.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, verify OTP, login, forgot/reset password")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Step 1: Register with name+email → receive OTP")
    public ResponseEntity<ApiResponse<MessageResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        MessageResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Step 2: Verify OTP + set password → account created + JWT")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyRegistration(
            @Valid @RequestBody VerifyRegistrationRequest request) {
        AuthResponse response = authService.verifyRegistration(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email + password → JWT")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password → receive OTP on email")
    public ResponseEntity<ApiResponse<MessageResponse>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        MessageResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with OTP + new password")
    public ResponseEntity<ApiResponse<MessageResponse>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        MessageResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public ResponseEntity<ApiResponse<UserDTO>> me(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User is not authenticated"));
        }
        UserDTO user = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}