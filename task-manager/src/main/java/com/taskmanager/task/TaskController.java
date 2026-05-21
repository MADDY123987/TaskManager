package com.taskmanager.task;

import com.taskmanager.common.ApiResponse;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.task.dto.TaskDTOs.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/api/projects/{projectId}/tasks")
    @Operation(summary = "Create a task (Admin only)")
    public ResponseEntity<ApiResponse<TaskDTO>> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskDTO task = taskService.createTask(projectId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created", task));
    }

    @GetMapping("/api/projects/{projectId}/tasks")
    @Operation(summary = "List tasks in a project")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getTasks(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assigneeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TaskDTO> tasks = taskService.getTasksForProject(projectId, status, assigneeId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/api/tasks/{taskId}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<ApiResponse<TaskDTO>> getTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskDTO task = taskService.getTaskById(taskId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @PutMapping("/api/tasks/{taskId}")
    @Operation(summary = "Update task (Admin: full edit; Member: status only)")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskDTO task = taskService.updateTask(taskId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Task updated", task));
    }

    @PatchMapping("/api/tasks/{taskId}/status")
    @Operation(summary = "Update task status (Assignee shortcut)")
    public ResponseEntity<ApiResponse<TaskDTO>> updateStatus(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UpdateTaskRequest updateReq = new UpdateTaskRequest();
        updateReq.setStatus(request.getStatus());
        TaskDTO task = taskService.updateTask(taskId, updateReq, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Status updated", task));
    }

    @DeleteMapping("/api/tasks/{taskId}")
    @Operation(summary = "Delete task (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserPrincipal principal) {
        taskService.deleteTask(taskId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Task deleted", null));
    }
}
