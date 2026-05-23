package com.taskmanager.audit.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id, occurred_at"),
        @Index(name = "idx_audit_actor",  columnList = "actor_id, occurred_at"),
        @Index(name = "idx_audit_action", columnList = "action, occurred_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    public enum EntityType { PROJECT, TASK, USER, COMMENT, ATTACHMENT }
    public enum Action     { CREATE, UPDATE, DELETE, LOGIN, LOGOUT, TRANSFER_OWNERSHIP, ARCHIVE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_id")                                   private Long   actorId;
    @Column(name = "actor_email", length = 255)                  private String actorEmail;

    @Column(name = "entity_type", nullable = false, length = 80) private String entityType;
    @Column(name = "entity_id",   nullable = false)              private Long   entityId;
    @Column(nullable = false, length = 80)                       private String action;

    @Column(columnDefinition = "TEXT")                           private String description;
    @Column(name = "ip_address", length = 60)                    private String ipAddress;
    @Column(name = "user_agent", length = 500)                   private String userAgent;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;
}
