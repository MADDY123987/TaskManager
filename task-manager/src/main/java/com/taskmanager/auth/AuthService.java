package com.taskmanager.auth;

import com.taskmanager.auth.dto.AuthDTOs.*;
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

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail());

        log.info("New user registered: {}", saved.getEmail());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = jwtUtil.generateToken(principal.getId(), principal.getEmail());

        log.info("User logged in: {}", principal.getEmail());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(principal.getId())
                .name(user.getName())
                .email(principal.getEmail())
                .build();
    }

    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}
