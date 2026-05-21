package com.taskmanager.project;

import com.taskmanager.common.ApiResponse;
import com.taskmanager.project.dto.ProjectDTOs.*;
import com.taskmanager.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "Create a project (caller becomes Admin)")
    public ResponseEntity<ApiResponse<ProjectDTO>> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectDTO project = projectService.createProject(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created", project));
    }

    @GetMapping
    @Operation(summary = "List projects for current user")
    public ResponseEntity<ApiResponse<List<ProjectSummaryDTO>>> getMyProjects(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ProjectSummaryDTO> projects = projectService.getProjectsForUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project details with members")
    public ResponseEntity<ApiResponse<ProjectDTO>> getProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectDTO project = projectService.getProjectById(projectId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(project));
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "Update project (Admin only)")
    public ResponseEntity<ApiResponse<ProjectDTO>> updateProject(
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectDTO project = projectService.updateProject(projectId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Project updated", project));
    }

    @DeleteMapping("/{projectId}")
    @Operation(summary = "Delete project (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        projectService.deleteProject(projectId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Project deleted", null));
    }

    @PostMapping("/{projectId}/members")
    @Operation(summary = "Add member to project (Admin only)")
    public ResponseEntity<ApiResponse<MemberDTO>> addMember(
            @PathVariable Long projectId,
            @Valid @RequestBody AddMemberRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        MemberDTO member = projectService.addMember(projectId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Member added", member));
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @Operation(summary = "Remove member from project (Admin only)")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        projectService.removeMember(projectId, userId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Member removed", null));
    }
}
