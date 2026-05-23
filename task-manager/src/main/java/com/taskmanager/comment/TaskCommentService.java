package com.taskmanager.comment;


import com.taskmanager.activity.ActivityService;
import com.taskmanager.activity.ActivityService.Action;
import com.taskmanager.auth.entity.User;
import com.taskmanager.auth.entity.UserRepository;
import com.taskmanager.comment.entity.TaskComment;
import com.taskmanager.comment.entity.TaskCommentRepository;
import com.taskmanager.exception.*;
import com.taskmanager.notification.NotificationFacade;
import com.taskmanager.project.entity.ProjectMemberRepository;
import com.taskmanager.task.entity.Task;
import com.taskmanager.task.entity.TaskRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskCommentService {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository memberRepository;
    private final NotificationFacade notificationFacade;
    private final ActivityService activityService;

    // ── List ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<CommentDTO> getComments(Long taskId, Long requesterId, int page, int size) {
        Task task = getTaskAndAssertMembership(taskId, requesterId);
        return commentRepository.findByTaskId(taskId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    // ── Create ───────────────────────────────────────────────────────────────

    @Transactional
    public CommentDTO addComment(Long taskId, Long authorId, CreateCommentRequest request) {
        Task task = getTaskAndAssertMembership(taskId, authorId);
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", authorId));

        TaskComment comment = TaskComment.builder()
                .task(task)
                .author(author)
                .content(request.getContent())
                .build();

        TaskComment saved = commentRepository.save(comment);
        log.info("Comment added on task {} by user {}", taskId, authorId);

        // Activity log
        activityService.record(taskId, task.getProject().getId(), authorId,
                Action.COMMENTED, null, null, null);

        // Notify task assignee (if different from commenter)
        if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(authorId)) {
            notificationFacade.commentAdded(
                    task.getAssignedTo().getId(),
                    task.getAssignedTo().getEmail(),
                    task.getAssignedTo().getName(),
                    task.getTitle(),
                    author.getName(),
                    request.getContent(),
                    taskId);
        }

        return toDTO(saved);
    }

    // ── Update ───────────────────────────────────────────────────────────────

    @Transactional
    public CommentDTO updateComment(Long commentId, Long authorId, CreateCommentRequest request) {
        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));

        if (!comment.getAuthor().getId().equals(authorId)) {
            throw new ForbiddenException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment.setEdited(true);
        return toDTO(commentRepository.save(comment));
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteComment(Long commentId, Long requesterId) {
        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));

        Long projectId = comment.getTask().getProject().getId();
        boolean isAuthor = comment.getAuthor().getId().equals(requesterId);
        boolean isAdmin  = memberRepository.findByProjectIdAndUserId(projectId, requesterId)
                .map(m -> m.getRole().name().equals("ADMIN"))
                .orElse(false);

        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException("Only the comment author or project admin can delete this comment");
        }

        commentRepository.deleteById(commentId);
        log.info("Comment {} deleted by user {}", commentId, requesterId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Task getTaskAndAssertMembership(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!memberRepository.existsByProjectIdAndUserId(task.getProject().getId(), userId)) {
            throw new ForbiddenException("You are not a member of this project");
        }
        return task;
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CommentDTO {
        private Long          id;
        private Long          taskId;
        private AuthorDTO     author;
        private String        content;
        private boolean       edited;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthorDTO {
        private Long   id;
        private String name;
        private String email;
        private String avatarUrl;
    }

    @Data
    public static class CreateCommentRequest {
        @NotBlank @Size(max = 5000)
        private String content;
    }

    private CommentDTO toDTO(TaskComment c) {
        return CommentDTO.builder()
                .id(c.getId())
                .taskId(c.getTask().getId())
                .author(AuthorDTO.builder()
                        .id(c.getAuthor().getId())
                        .name(c.getAuthor().getName())
                        .email(c.getAuthor().getEmail())
                        .avatarUrl(c.getAuthor().getAvatarUrl())
                        .build())
                .content(c.getContent())
                .edited(c.isEdited())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
