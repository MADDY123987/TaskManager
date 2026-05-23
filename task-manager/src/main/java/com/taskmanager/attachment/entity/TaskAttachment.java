package com.taskmanager.attachment.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_attachments",
        indexes = @Index(name = "idx_attachments_task", columnList = "task_id"))
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id",        nullable = false) private Long   taskId;
    @Column(name = "uploaded_by_id", nullable = false) private Long   uploadedById;

    @Column(name = "file_name",    nullable = false, length = 500)  private String fileName;
    @Column(name = "storage_key",  nullable = false, length = 1000) private String storageKey;
    @Column(name = "content_type", length = 100)                    private String contentType;
    @Column(name = "size_bytes")                                     private Long   sizeBytes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

