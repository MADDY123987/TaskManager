package com.taskmanager.messaging;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskEvents {

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class TaskAssignedEvent implements Serializable {
        private Long taskId;
        private String taskTitle;
        private Long projectId;
        private String projectName;
        private Long assignedToUserId;
        private String assignedToEmail;
        private String assignedToName;
        private Long assignedByUserId;
        private String assignedByName;
        private LocalDate dueDate;
        private LocalDateTime occurredAt;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class TaskOverdueEvent implements Serializable {
        private Long taskId;
        private String taskTitle;
        private Long projectId;
        private Long assignedToUserId;
        private String assignedToEmail;
        private LocalDate dueDate;
        private LocalDateTime detectedAt;
    }
}
