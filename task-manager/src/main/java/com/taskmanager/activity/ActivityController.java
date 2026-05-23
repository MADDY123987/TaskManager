package com.taskmanager.activity;


import com.taskmanager.common.ApiResponse;
import com.taskmanager.project.entity.ProjectMemberRepository;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.exception.ForbiddenException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Activity", description = "Task and project activity timelines")
@SecurityRequirement(name = "bearerAuth")
public class ActivityController {

    private final ActivityService activityService;
    private final ProjectMemberRepository memberRepository;

    @GetMapping("/api/tasks/{taskId}/activity")
    @Operation(summary = "Activity timeline for a task")
    public ResponseEntity<ApiResponse<Page<ActivityService.ActivityDTO>>> taskTimeline(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        // membership check happens inside the service via project lookup
        return ResponseEntity.ok(ApiResponse.success(
                activityService.getTaskTimeline(taskId, page, size)));
    }

    @GetMapping("/api/projects/{projectId}/activity")
    @Operation(summary = "Full activity timeline for a project")
    public ResponseEntity<ApiResponse<Page<ActivityService.ActivityDTO>>> projectTimeline(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, principal.getId())) {
            throw new ForbiddenException("You are not a member of this project");
        }
        return ResponseEntity.ok(ApiResponse.success(
                activityService.getProjectTimeline(projectId, page, size)));
    }
}

