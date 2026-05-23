package com.taskmanager.activity;


import com.taskmanager.activity.entity.TaskActivity;
import com.taskmanager.activity.entity.TaskActivityRepository;
import com.taskmanager.auth.entity.UserRepository;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final TaskActivityRepository activityRepository;
    private final UserRepository userRepository;

    public enum Action {
        TASK_CREATED, TASK_UPDATED, STATUS_CHANGED, PRIORITY_CHANGED,
        ASSIGNED, UNASSIGNED, COMMENTED, ATTACHMENT_ADDED, ATTACHMENT_REMOVED,
        DUE_DATE_CHANGED, TASK_DELETED, TASK_COMPLETED
    }

    // ── Record (async — never blocks the caller) ──────────────────────────────

    @Async
    @Transactional
    public void record(Long taskId, Long projectId, Long actorId,
                       Action action, String fieldName,
                       String oldValue, String newValue) {
        try {
            String actorName = actorId == null ? "System" :
                    userRepository.findById(actorId)
                    .map(u -> u.getName() + " (" + u.getEmail() + ")")
                    .orElse("Unknown");

            TaskActivity activity = TaskActivity.builder()
                    .taskId(taskId)
                    .projectId(projectId)
                    .actorId(actorId)
                    .actorName(actorName)
                    .action(action.name())
                    .fieldName(fieldName)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .occurredAt(LocalDateTime.now())
                    .build();

            activityRepository.save(activity);
        } catch (Exception ex) {
            log.error("Failed to record activity for task {}: {}", taskId, ex.getMessage());
        }
    }

    // ── Query ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ActivityDTO> getTaskTimeline(Long taskId, int page, int size) {
        return activityRepository
                .findByTaskIdOrderByOccurredAtDesc(taskId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ActivityDTO> getProjectTimeline(Long projectId, int page, int size) {
        return activityRepository
                .findByProjectIdOrderByOccurredAtDesc(projectId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    // ── DTO ───────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ActivityDTO {
        private Long          id;
        private Long          taskId;
        private Long          projectId;
        private Long          actorId;
        private String        actorName;
        private String        action;
        private String        fieldName;
        private String        oldValue;
        private String        newValue;
        private String        summary;          // human-readable sentence
        private LocalDateTime occurredAt;
    }

    private ActivityDTO toDTO(TaskActivity a) {
        return ActivityDTO.builder()
                .id(a.getId())
                .taskId(a.getTaskId())
                .projectId(a.getProjectId())
                .actorId(a.getActorId())
                .actorName(a.getActorName())
                .action(a.getAction())
                .fieldName(a.getFieldName())
                .oldValue(a.getOldValue())
                .newValue(a.getNewValue())
                .summary(buildSummary(a))
                .occurredAt(a.getOccurredAt())
                .build();
    }

    private String buildSummary(TaskActivity a) {
        String actor = a.getActorName() != null ? a.getActorName() : "System";
        return switch (a.getAction()) {
            case "TASK_CREATED"       -> actor + " created this task";
            case "TASK_COMPLETED"     -> actor + " marked this task as completed";
            case "STATUS_CHANGED"     -> actor + " changed status from " + a.getOldValue() + " → " + a.getNewValue();
            case "PRIORITY_CHANGED"   -> actor + " changed priority from " + a.getOldValue() + " → " + a.getNewValue();
            case "ASSIGNED"           -> actor + " assigned this task to " + a.getNewValue();
            case "UNASSIGNED"         -> actor + " unassigned " + a.getOldValue();
            case "COMMENTED"          -> actor + " added a comment";
            case "DUE_DATE_CHANGED"   -> actor + " changed due date from " + a.getOldValue() + " → " + a.getNewValue();
            case "ATTACHMENT_ADDED"   -> actor + " attached " + a.getNewValue();
            case "ATTACHMENT_REMOVED" -> actor + " removed attachment " + a.getOldValue();
            default                   -> actor + " updated this task";
        };
    }
}
