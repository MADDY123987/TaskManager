package com.taskmanager.notification.entity;



import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_user_unread", columnList = "user_id, is_read"),
        @Index(name = "idx_notifications_user_created", columnList = "user_id, created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    public enum Type {
        TASK_ASSIGNED, TASK_COMPLETED, TASK_OVERDUE, MEMBER_ADDED, COMMENT_ADDED, PROJECT_UPDATED
    }

    public enum ReferenceType {
        TASK, PROJECT, COMMENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            columnDefinition = "VARCHAR(60)"
    )
    private Type type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "reference_type",
            nullable = true,
            columnDefinition = "VARCHAR(60)"
    )
    private ReferenceType referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public void markRead() {
        this.read = true;
        this.readAt = LocalDateTime.now();
    }
}
