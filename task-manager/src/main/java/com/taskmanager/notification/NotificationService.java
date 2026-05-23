package com.taskmanager.notification;



import com.taskmanager.notification.entity.Notification;
import com.taskmanager.notification.entity.Notification.ReferenceType;
import com.taskmanager.notification.entity.Notification.Type;
import com.taskmanager.notification.entity.NotificationRepository;
import com.taskmanager.exception.ResourceNotFoundException;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ── Create ──────────────────────────────────────────────────────────────

    @Transactional
    public Notification create(Long userId, Type type, String title, String message,
                               ReferenceType refType, Long refId) {
        Notification n = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .referenceType(refType)
                .referenceId(refId)
                .build();
        return notificationRepository.save(n);
    }

    // ── Query ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnread(Long userId) {
        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    // ── Mark read ────────────────────────────────────────────────────────────

    @Transactional
    public void markRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markOneRead(notificationId, userId);
        if (updated == 0) {
            throw new ResourceNotFoundException("Notification", notificationId);
        }
    }

    @Transactional
    public int markAllRead(Long userId) {
        return notificationRepository.markAllReadForUser(userId);
    }

    // ── DTO ──────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NotificationDTO {
        private Long id;
        private String type;
        private String title;
        private String message;
        private String referenceType;
        private Long referenceId;
        private boolean read;
        private LocalDateTime readAt;
        private LocalDateTime createdAt;
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .type(n.getType().name())
                .title(n.getTitle())
                .message(n.getMessage())
                .referenceType(n.getReferenceType() != null ? n.getReferenceType().name() : null)
                .referenceId(n.getReferenceId())
                .read(n.isRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
