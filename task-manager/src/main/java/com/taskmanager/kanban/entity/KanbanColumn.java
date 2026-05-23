package com.taskmanager.kanban.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "kanban_columns",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "name"}),
        indexes = @Index(name = "idx_kanban_cols_project", columnList = "project_id, position"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanbanColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private int position = 0;

    @Column(length = 20)
    private String color;          // hex code, e.g. "#3B82F6"

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
