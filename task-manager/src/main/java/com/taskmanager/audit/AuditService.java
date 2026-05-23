package com.taskmanager.audit;



import com.taskmanager.audit.entity.AuditLog;
import com.taskmanager.audit.entity.AuditLogRepository;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    // ── Record (always async, never throws) ───────────────────────────────────

    @Async
    @Transactional
    public void log(Long actorId, String actorEmail,
                    AuditLog.EntityType entityType, Long entityId,
                    AuditLog.Action action, String description,
                    String ipAddress, String userAgent) {
        try {
            auditLogRepository.save(AuditLog.builder()
                    .actorId(actorId)
                    .actorEmail(actorEmail)
                    .entityType(entityType.name())
                    .entityId(entityId)
                    .action(action.name())
                    .description(description)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .occurredAt(LocalDateTime.now())
                    .build());
        } catch (Exception ex) {
            log.error("Audit log failed: {}", ex.getMessage());
        }
    }

    /** Convenience: log without HTTP context */
    @Async
    @Transactional
    public void log(Long actorId, String actorEmail,
                    AuditLog.EntityType entityType, Long entityId,
                    AuditLog.Action action, String description) {
        log(actorId, actorEmail, entityType, entityId, action, description, null, null);
    }

    // ── Query ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getLogsForEntity(String entityType, Long entityId, int page, int size) {
        return auditLogRepository
                .findByEntityTypeAndEntityIdOrderByOccurredAtDesc(
                        entityType.toUpperCase(), entityId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getLogsForActor(Long actorId, int page, int size) {
        return auditLogRepository
                .findByActorIdOrderByOccurredAtDesc(actorId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAllLogs(int page, int size) {
        return auditLogRepository
                .findAllByOrderByOccurredAtDesc(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    // ── DTO ───────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuditLogDTO {
        private Long          id;
        private Long          actorId;
        private String        actorEmail;
        private String        entityType;
        private Long          entityId;
        private String        action;
        private String        description;
        private String        ipAddress;
        private LocalDateTime occurredAt;
    }

    private AuditLogDTO toDTO(AuditLog a) {
        return AuditLogDTO.builder()
                .id(a.getId())
                .actorId(a.getActorId())
                .actorEmail(a.getActorEmail())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .action(a.getAction())
                .description(a.getDescription())
                .ipAddress(a.getIpAddress())
                .occurredAt(a.getOccurredAt())
                .build();
    }
}
