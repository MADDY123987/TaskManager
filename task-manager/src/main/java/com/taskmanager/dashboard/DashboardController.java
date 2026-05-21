package com.taskmanager.dashboard;

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
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Aggregated metrics with Redis cache + circuit breaker")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Get dashboard metrics for current user (cached 60s)")
    public ResponseEntity<ApiResponse<DashboardService.DashboardDTO>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardService.DashboardDTO dashboard = dashboardService.getDashboard(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
