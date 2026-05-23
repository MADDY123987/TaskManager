package com.taskmanager.analytics;

import com.taskmanager.common.ApiResponse;
import com.taskmanager.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Project-level analytics: velocity, burndown, member stats")
@SecurityRequirement(name = "bearerAuth")
public class ProjectAnalyticsController {

    private final ProjectAnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "Full analytics snapshot — cached 5 min per project/user")
    public ResponseEntity<ApiResponse<ProjectAnalyticsService.ProjectAnalyticsDTO>> getAnalytics(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getAnalytics(projectId, principal.getId())));
    }
}
