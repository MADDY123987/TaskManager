package com.taskmanager.task.dto;

import com.taskmanager.task.entity.Task.Priority;
import com.taskmanager.task.entity.Task.Status;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDTOs {

    @Data
    public static class CreateTaskRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 300)
        private String title;

        @Size(max = 5000)
        private String description;

        private LocalDate dueDate;

        private Priority priority = Priority.MEDIUM;

        private Long assignedTo;
    }

    @Data
    public static class UpdateTaskRequest {
        @Size(max = 300)
        private String title;

        @Size(max = 5000)
        private String description;

        private LocalDate dueDate;

        private Priority priority;

        // Members can only update status; service layer enforces this
        private Status status;

        private Long assignedTo; // Admin only
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private Status status;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class TaskDTO {
        private Long id;
        private Long projectId;
        private String projectName;
        private String title;
        private String description;
        private Priority priority;
        private Status status;
        private LocalDate dueDate;
        private boolean overdue;
        private AssigneeDTO assignedTo;
        private AssigneeDTO createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class AssigneeDTO {
        private Long id;
        private String name;
        private String email;
    }
}
