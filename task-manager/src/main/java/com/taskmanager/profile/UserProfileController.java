package com.taskmanager.profile;



import com.taskmanager.common.ApiResponse;
import com.taskmanager.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Extended user profile — phone, department, designation, bio, avatar")
@SecurityRequirement(name = "bearerAuth")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    @Operation(summary = "Get current user's profile")
    public ResponseEntity<ApiResponse<UserProfileService.UserProfileDTO>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                userProfileService.getProfile(principal.getId())));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get any user's public profile")
    public ResponseEntity<ApiResponse<UserProfileService.UserProfileDTO>> getUserProfile(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
                userProfileService.getProfile(userId)));
    }

    @PutMapping
    @Operation(summary = "Update current user's profile")
    public ResponseEntity<ApiResponse<UserProfileService.UserProfileDTO>> updateProfile(
            @Valid @RequestBody UserProfileService.UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                userProfileService.updateProfile(principal.getId(), request)));
    }

    @PatchMapping("/avatar")
    @Operation(summary = "Set avatar URL (pass pre-uploaded URL or CDN link)")
    public ResponseEntity<ApiResponse<UserProfileService.UserProfileDTO>> updateAvatar(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String url = body.get("avatarUrl");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("avatarUrl is required"));
        }
        return ResponseEntity.ok(ApiResponse.success("Avatar updated",
                userProfileService.updateAvatarUrl(principal.getId(), url)));
    }
}
