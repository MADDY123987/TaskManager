package com.taskmanager.project;



import com.taskmanager.common.ApiResponse;
import com.taskmanager.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/settings")
@RequiredArgsConstructor
@Tag(name = "Project Settings", description = "Archive, restore, ownership transfer, JSON settings")
@SecurityRequirement(name = "bearerAuth")
public class ProjectSettingsController {

    private final ProjectSettingsService settingsService;

    @GetMapping
    @Operation(summary = "Get project settings (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                settingsService.getSettings(projectId, principal.getId())));
    }

    @PutMapping
    @Operation(summary = "Update project settings — arbitrary JSON payload (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateSettings(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> settings,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Settings updated",
                settingsService.updateSettings(projectId, principal.getId(), settings)));
    }

    @PostMapping("/archive")
    @Operation(summary = "Archive this project (Admin only) — hides from default project list")
    public ResponseEntity<ApiResponse<Void>> archive(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        settingsService.archiveProject(projectId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Project archived", null));
    }

    @PostMapping("/restore")
    @Operation(summary = "Restore an archived project (Admin only)")
    public ResponseEntity<ApiResponse<Void>> restore(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        settingsService.restoreProject(projectId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Project restored", null));
    }

    @PostMapping("/transfer-ownership")
    @Operation(summary = "Transfer project ownership to another member (Admin only)")
    public ResponseEntity<ApiResponse<Void>> transferOwnership(
            @PathVariable Long projectId,
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long newOwnerId = body.get("newOwnerId");
        if (newOwnerId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("newOwnerId is required"));
        }
        settingsService.transferOwnership(projectId, principal.getId(), newOwnerId);
        return ResponseEntity.ok(ApiResponse.success("Ownership transferred", null));
    }
}
