package com.taskmanager.websocket;


import com.taskmanager.notification.NotificationService.NotificationDTO;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Pushes real-time WebSocket events to clients.
 *
 * Usage (inject anywhere):
 *   wsNotificationService.pushToUser(userId, event);
 *   wsNotificationService.pushToProject(projectId, event);
 *
 * Client subscribes to:
 *   /user/queue/notifications       ← personal bell events
 *   /topic/projects/{id}            ← project-wide task board updates
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // ── Push to a single user ─────────────────────────────────────────────────

    public void pushToUser(Long userId, WsEvent event) {
        try {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    event);
            log.debug("WS push to user {}: {}", userId, event.getType());
        } catch (Exception ex) {
            log.error("WS push to user {} failed: {}", userId, ex.getMessage());
        }
    }

    // ── Broadcast to a project channel ────────────────────────────────────────

    public void pushToProject(Long projectId, WsEvent event) {
        try {
            messagingTemplate.convertAndSend(
                    "/topic/projects/" + projectId,
                    event);
            log.debug("WS broadcast to project {}: {}", projectId, event.getType());
        } catch (Exception ex) {
            log.error("WS broadcast to project {} failed: {}", projectId, ex.getMessage());
        }
    }

    // ── Convenience factories ─────────────────────────────────────────────────

    public WsEvent notificationEvent(NotificationDTO notification) {
        return WsEvent.builder()
                .type("NOTIFICATION")
                .payload(notification)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public WsEvent taskUpdatedEvent(Long taskId, Long projectId, String action, Object payload) {
        return WsEvent.builder()
                .type("TASK_" + action)
                .referenceId(taskId)
                .projectId(projectId)
                .payload(payload)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public WsEvent commentEvent(Long taskId, Long projectId, Object commentPayload) {
        return WsEvent.builder()
                .type("COMMENT_ADDED")
                .referenceId(taskId)
                .projectId(projectId)
                .payload(commentPayload)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ── Event envelope ────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class WsEvent {
        private String        type;          // NOTIFICATION, TASK_UPDATED, COMMENT_ADDED, …
        private Long          referenceId;   // taskId or null
        private Long          projectId;
        private Object        payload;       // any serialisable DTO
        private LocalDateTime timestamp;
    }
}
