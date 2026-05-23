package com.taskmanager.kanban;

import com.taskmanager.common.ApiResponse;
import com.taskmanager.security.UserPrincipal;
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
@RequestMapping("/api/projects/{projectId}/board")
@RequiredArgsConstructor
@Tag(name = "Kanban Board", description = "Drag-and-drop kanban board — columns and task cards")
@SecurityRequirement(name = "bearerAuth")
public class KanbanController {

    private final KanbanService kanbanService;

    @GetMapping
    @Operation(summary = "Get full board — all columns with task cards")
    public ResponseEntity<ApiResponse<KanbanService.BoardDTO>> getBoard(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                kanbanService.getBoard(projectId, principal.getId())));
    }

    @GetMapping("/columns")
    @Operation(summary = "List kanban columns for a project")
    public ResponseEntity<ApiResponse<List<KanbanService.ColumnDTO>>> getColumns(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                kanbanService.getColumns(projectId, principal.getId())));
    }

    @PostMapping("/columns")
    @Operation(summary = "Add a new column (Admin only)")
    public ResponseEntity<ApiResponse<KanbanService.ColumnDTO>> addColumn(
            @PathVariable Long projectId,
            @Valid @RequestBody KanbanService.CreateColumnRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Column created",
                        kanbanService.addColumn(projectId, principal.getId(), request)));
    }

    @PutMapping("/columns/{columnId}")
    @Operation(summary = "Rename or recolor a column (Admin only)")
    public ResponseEntity<ApiResponse<KanbanService.ColumnDTO>> updateColumn(
            @PathVariable Long projectId,
            @PathVariable Long columnId,
            @RequestBody KanbanService.UpdateColumnRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Column updated",
                kanbanService.updateColumn(projectId, columnId, principal.getId(), request)));
    }

    @DeleteMapping("/columns/{columnId}")
    @Operation(summary = "Delete a column — tasks in it are unassigned (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteColumn(
            @PathVariable Long projectId,
            @PathVariable Long columnId,
            @AuthenticationPrincipal UserPrincipal principal) {
        kanbanService.deleteColumn(projectId, columnId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Column deleted", null));
    }

    @PatchMapping("/columns/reorder")
    @Operation(summary = "Reorder columns — pass ordered list of column IDs (Admin only)")
    public ResponseEntity<ApiResponse<List<KanbanService.ColumnDTO>>> reorderColumns(
            @PathVariable Long projectId,
            @RequestBody List<Long> orderedColumnIds,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Columns reordered",
                kanbanService.reorderColumns(projectId, principal.getId(), orderedColumnIds)));
    }

    @PatchMapping("/tasks/{taskId}/move")
    @Operation(summary = "Move task to a column at a position (drag-and-drop)")
    public ResponseEntity<ApiResponse<Void>> moveTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody KanbanService.MoveTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        kanbanService.moveTask(projectId, taskId,
                request.getColumnId(), request.getPosition(), principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Task moved", null));
    }
}
