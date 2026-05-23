package com.taskmanager.comment;


import com.taskmanager.common.ApiResponse;
import com.taskmanager.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Task comment thread")
@SecurityRequirement(name = "bearerAuth")
public class TaskCommentController {

    private final TaskCommentService commentService;

    @GetMapping
    @Operation(summary = "List comments for a task (paginated, oldest first)")
    public ResponseEntity<ApiResponse<Page<TaskCommentService.CommentDTO>>> list(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                commentService.getComments(taskId, principal.getId(), page, size)));
    }

    @PostMapping
    @Operation(summary = "Add a comment to a task")
    public ResponseEntity<ApiResponse<TaskCommentService.CommentDTO>> add(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskCommentService.CreateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added",
                        commentService.addComment(taskId, principal.getId(), request)));
    }

    @PutMapping("/{commentId}")
    @Operation(summary = "Edit your own comment")
    public ResponseEntity<ApiResponse<TaskCommentService.CommentDTO>> update(
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            @Valid @RequestBody TaskCommentService.CreateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Comment updated",
                commentService.updateComment(commentId, principal.getId(), request)));
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Delete a comment (author or project admin)")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        commentService.deleteComment(commentId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }
}
