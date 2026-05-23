package com.taskmanager.attachment;


import com.taskmanager.common.ApiResponse;
import com.taskmanager.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks/{taskId}/attachments")
@RequiredArgsConstructor
@Tag(name = "Attachments", description = "Task file attachments (S3/MinIO)")
@SecurityRequirement(name = "bearerAuth")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping
    @Operation(summary = "List attachments for a task (includes presigned download URLs)")
    public ResponseEntity<ApiResponse<List<AttachmentService.AttachmentDTO>>> list(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                attachmentService.list(taskId, principal.getId())));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a file attachment to a task (max 20 MB)")
    public ResponseEntity<ApiResponse<AttachmentService.AttachmentDTO>> upload(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File uploaded",
                        attachmentService.upload(taskId, principal.getId(), file)));
    }

    @GetMapping("/{attachmentId}/download-url")
    @Operation(summary = "Get a short-lived presigned download URL for an attachment")
    public ResponseEntity<ApiResponse<Map<String, String>>> downloadUrl(
            @PathVariable Long taskId,
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        String url = attachmentService.getDownloadUrl(attachmentId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }

    @DeleteMapping("/{attachmentId}")
    @Operation(summary = "Delete an attachment (uploader or project admin)")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long taskId,
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        attachmentService.delete(attachmentId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Attachment deleted", null));
    }
}
