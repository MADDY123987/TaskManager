package com.taskmanager.project.dto;

import com.taskmanager.project.entity.ProjectMember.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class ProjectDTOs {

    @Data
    public static class CreateProjectRequest {
        @NotBlank(message = "Project name is required")
        @Size(max = 200)
        private String name;

        @Size(max = 2000)
        private String description;
    }

    @Data
    public static class UpdateProjectRequest {
        @Size(max = 200)
        private String name;

        @Size(max = 2000)
        private String description;
    }

    @Data
    public static class AddMemberRequest {
        @NotNull(message = "User ID is required")
        private Long userId;

        private Role role = Role.MEMBER;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ProjectDTO {
        private Long id;
        private String name;
        private String description;
        private Long createdBy;
        private String createdByName;
        private List<MemberDTO> members;
        private LocalDateTime createdAt;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class MemberDTO {
        private Long userId;
        private String name;
        private String email;
        private Role role;
        private LocalDateTime joinedAt;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ProjectSummaryDTO {
        private Long id;
        private String name;
        private String description;
        private int memberCount;
        private LocalDateTime createdAt;
    }
}
