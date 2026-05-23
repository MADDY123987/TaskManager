package com.taskmanager.activity.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_activities", indexes = {
        @Index(name = "idx_task_activities_task",    columnList = "task_id, occurred_at"),
        @Index(name = "idx_task_activities_project", columnList = "project_id, occurred_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id",    nullable = false) private Long taskId;
    @Column(name = "project_id", nullable = false) private Long projectId;
    @Column(name = "actor_id")                     private Long actorId;

    @Column(name = "actor_name", length = 255)     private String actorName;

    @Column(nullable = false, length = 80)         private String action;
    @Column(name = "field_name", length = 80)      private String fieldName;
    @Column(name = "old_value",  columnDefinition = "TEXT") private String oldValue;
    @Column(name = "new_value",  columnDefinition = "TEXT") private String newValue;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;
}
