package com.taskmanager.audit;


import com.taskmanager.common.ApiResponse;
import com.taskmanager.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "System-wide audit trail")
@SecurityRequirement(name = "bearerAuth")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "All audit logs — system admin only")
    public ResponseEntity<ApiResponse<Page<AuditService.AuditLogDTO>>> all(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAllLogs(page, size)));
    }

    @GetMapping("/me")
    @Operation(summary = "Audit logs for the current user's own actions")
    public ResponseEntity<ApiResponse<Page<AuditService.AuditLogDTO>>> myLogs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                auditService.getLogsForActor(principal.getId(), page, size)));
    }

    @GetMapping("/{entityType}/{entityId}")
    @Operation(summary = "Audit logs for a specific entity (e.g. PROJECT/5, TASK/12)")
    public ResponseEntity<ApiResponse<Page<AuditService.AuditLogDTO>>> forEntity(
            @PathVariable String entityType,
            @PathVariable Long   entityId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                auditService.getLogsForEntity(entityType, entityId, page, size)));
    }
}
