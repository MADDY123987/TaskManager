package com.taskmanager.auth;



import com.taskmanager.auth.dto.AuthDTOs.*;
import com.taskmanager.auth.entity.OtpPurpose;
import com.taskmanager.auth.entity.User;
import com.taskmanager.auth.entity.UserRepository;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.security.JwtUtil;
import com.taskmanager.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    // ── Step 1: Register → just send OTP, don't create user yet ──────────
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }
        otpService.generateAndSendOtp(request.getEmail(), OtpPurpose.REGISTRATION);
        log.info("Registration OTP sent to: {}", request.getEmail());
        return MessageResponse.builder()
                .message("OTP sent to " + request.getEmail() + ". Please verify to complete registration.")
                .build();
    }

    // ── Step 2: Verify OTP + create user + return JWT ─────────────────────
    @Transactional
    public AuthResponse verifyRegistration(VerifyRegistrationRequest request) {
        // Verify OTP first — throws if invalid/expired
        otpService.verifyOtp(request.getEmail(), request.getOtp(), OtpPurpose.REGISTRATION);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(true)
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail());

        log.info("User registered after OTP verification: {}", saved.getEmail());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .build();
    }

    // ── Login: email + password only ──────────────────────────────────────
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        if (principal == null || principal.getId() == null) {
            log.error("Principal is null or has no ID after authentication");
            throw new BadRequestException("Authentication failed: invalid principal");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> {
                    log.error("User not found after authentication with id: {}", principal.getId());
                    return new BadRequestException("User not found after authentication");
                });

        String token = jwtUtil.generateToken(principal.getId(), principal.getEmail());
        log.info("User logged in successfully: {}", principal.getEmail());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(principal.getId())
                .name(user.getName())
                .email(principal.getEmail())
                .build();
    }

    // ── Forgot Password → send OTP ────────────────────────────────────────
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        // Always return success message (don't leak whether email exists)
        if (userRepository.existsByEmail(request.getEmail())) {
            otpService.generateAndSendOtp(request.getEmail(), OtpPurpose.PASSWORD_RESET);
            log.info("Password reset OTP sent to: {}", request.getEmail());
        }
        return MessageResponse.builder()
                .message("If this email is registered, an OTP has been sent.")
                .build();
    }

    // ── Reset Password: verify OTP + update password ──────────────────────
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getOtp(), OtpPurpose.PASSWORD_RESET);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password reset successful for: {}", request.getEmail());
        return MessageResponse.builder()
                .message("Password reset successful. You can now login.")
                .build();
    }

    // ── Get current user ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(Long userId) {
        if (userId == null || userId <= 0) {
            log.warn("Invalid user ID provided: {}", userId);
            throw new BadRequestException("Invalid user ID");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with id: {}", userId);
                    return new BadRequestException("User not found");
                });
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}