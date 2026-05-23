package com.taskmanager.profile;


import com.taskmanager.auth.entity.UserRepository;
import com.taskmanager.exception.ResourceNotFoundException;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

/**
 * Manages the extended user profile fields added via V2 migration:
 * phone, department, designation, bio, avatar_url.
 *
 * Avatar upload delegates to StorageService (Phase 3 — S3/MinIO).
 * Until Phase 3 is wired, it stores a URL string directly.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService {

    private final UserRepository userRepository;

    // ── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public UserProfileDTO getProfile(Long userId) {
        return userRepository.findById(userId)
                .map(u -> UserProfileDTO.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .department(u.getDepartment())
                        .designation(u.getDesignation())
                        .bio(u.getBio())
                        .avatarUrl(u.getAvatarUrl())
                        .notificationEmailEnabled(u.isNotificationEmailEnabled())
                        .build())
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    // ── Update profile ───────────────────────────────────────────────────────

    @Transactional
    public UserProfileDTO updateProfile(Long userId, @Valid UpdateProfileRequest request) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (request.getName()        != null) user.setName(request.getName());
        if (request.getPhone()       != null) user.setPhone(request.getPhone());
        if (request.getDepartment()  != null) user.setDepartment(request.getDepartment());
        if (request.getDesignation() != null) user.setDesignation(request.getDesignation());
        if (request.getBio()         != null) user.setBio(request.getBio());

        if (request.getNotificationEmailEnabled() != null) {
            user.setNotificationEmailEnabled(request.getNotificationEmailEnabled());
        }

        userRepository.save(user);
        log.info("Profile updated for user {}", userId);
        return getProfile(userId);
    }

    // ── Avatar ───────────────────────────────────────────────────────────────

    /**
     * Store avatar URL (from frontend CDN upload or direct URL).
     * Replace this with StorageService.upload() in Phase 3.
     */
    @Transactional
    public UserProfileDTO updateAvatarUrl(Long userId, String avatarUrl) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return getProfile(userId);
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserProfileDTO {
        private Long    id;
        private String  name;
        private String  email;
        private String  phone;
        private String  department;
        private String  designation;
        private String  bio;
        private String  avatarUrl;
        private boolean notificationEmailEnabled;
    }

    @Data
    public static class UpdateProfileRequest {
        @Size(max = 100)
        private String  name;
        @Size(max = 30)
        private String  phone;
        @Size(max = 100)
        private String  department;
        @Size(max = 100)
        private String  designation;
        @Size(max = 1000)
        private String  bio;
        private Boolean notificationEmailEnabled;
    }
}
