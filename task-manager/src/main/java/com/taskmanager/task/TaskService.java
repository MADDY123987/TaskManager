package com.taskmanager.task;

import com.taskmanager.activity.ActivityService;
import com.taskmanager.activity.ActivityService.Action;
import com.taskmanager.auth.entity.User;
import com.taskmanager.auth.entity.UserRepository;
import com.taskmanager.exception.*;
import com.taskmanager.messaging.TaskEventPublisher;
import com.taskmanager.messaging.TaskEvents;
import com.taskmanager.notification.NotificationFacade;
import com.taskmanager.project.entity.*;
import com.taskmanager.project.entity.ProjectMember.Role;
import com.taskmanager.task.dto.TaskDTOs.*;
import com.taskmanager.task.entity.Task;
import com.taskmanager.task.entity.Task.Status;
import com.taskmanager.task.entity.TaskRepository;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository          taskRepository;
    private final ProjectRepository       projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository          userRepository;
    private final TaskEventPublisher      eventPublisher;
    private final NotificationFacade      notificationFacade; // ← NEW
    private final ActivityService         activityService;    // ← NEW

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "dashboard", allEntries = true)
    public TaskDTO createTask(Long projectId, CreateTaskRequest request, Long creatorId) {
        assertAdminRole(projectId, creatorId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", creatorId));

        User assignee = null;
        if (request.getAssignedTo() != null) {
            assignee = userRepository.findById(request.getAssignedTo())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user", request.getAssignedTo()));
            if (!memberRepository.existsByProjectIdAndUserId(projectId, assignee.getId())) {
                throw new BadRequestException("Assigned user is not a member of this project");
            }
        }

        Task task = Task.builder()
                .project(project)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(Status.TODO)
                .dueDate(request.getDueDate())
                .assignedTo(assignee)
                .createdBy(creator)
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task '{}' created in project {} by user {}", saved.getTitle(), projectId, creatorId);

        // Publish async assignment event if assignee set
        if (assignee != null) {
            publishAssignmentEvent(saved, assignee, creator, project);
        }

        // ── NEW: record activity ─────────────────────────────────────────────
        activityService.record(
                saved.getId(), projectId, creatorId,
                Action.TASK_CREATED, null, null, null);

        return toDTO(saved);
    }

    // ── List ──────────────────────────────────────────────────────────────────

    @CircuitBreaker(name = "taskService", fallbackMethod = "getTasksFallback")
    @Retry(name = "taskService")
    @Bulkhead(name = "taskService")
    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksForProject(Long projectId, String statusStr,
                                            Long assigneeId, Long requesterId) {
        assertMembership(projectId, requesterId);

        Status status = null;
        if (statusStr != null) {
            try { status = Status.valueOf(statusStr.toUpperCase()); }
            catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status value: " + statusStr);
            }
        }

        ProjectMember requester = memberRepository.findByProjectIdAndUserId(projectId, requesterId)
                .orElseThrow(() -> new ForbiddenException("Not a project member"));

        Long effectiveAssigneeId = assigneeId;
        if (requester.getRole() == Role.MEMBER) {
            effectiveAssigneeId = requesterId;
        }

        return taskRepository.findTasksFiltered(projectId, status, effectiveAssigneeId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksFallback(Long projectId, String statusStr,
                                          Long assigneeId, Long requesterId, Exception ex) {
        log.warn("Circuit breaker open for getTasksForProject: {}", ex.getMessage());
        return List.of();
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public TaskDTO getTaskById(Long taskId, Long requesterId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Long projectId = task.getProject().getId();
        assertMembership(projectId, requesterId);

        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, requesterId)
                .orElseThrow(() -> new ForbiddenException("Not a member"));

        if (member.getRole() == Role.MEMBER &&
                (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(requesterId))) {
            throw new ForbiddenException("You can only view tasks assigned to you");
        }

        return toDTO(task);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "dashboard", allEntries = true)
    public TaskDTO updateTask(Long taskId, UpdateTaskRequest request, Long requesterId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Long projectId = task.getProject().getId();

        // ── NEW: capture old values before any mutation ──────────────────────
        Status oldStatus   = task.getStatus();
        String oldPriority = task.getPriority() != null ? task.getPriority().name() : null;
        String oldAssignee = task.getAssignedTo() != null ? task.getAssignedTo().getName() : null;
        String oldDueDate  = task.getDueDate() != null ? task.getDueDate().toString() : null;

        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, requesterId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this project"));

        if (member.getRole() == Role.ADMIN) {

            if (request.getTitle() != null)       task.setTitle(request.getTitle());
            if (request.getDescription() != null) task.setDescription(request.getDescription());

            // ── NEW: record due date change ──────────────────────────────────
            if (request.getDueDate() != null) {
                activityService.record(taskId, projectId, requesterId,
                        Action.DUE_DATE_CHANGED, "dueDate",
                        oldDueDate, request.getDueDate().toString());
                task.setDueDate(request.getDueDate());
            }

            // ── NEW: record priority change ──────────────────────────────────
            if (request.getPriority() != null) {
                activityService.record(taskId, projectId, requesterId,
                        Action.PRIORITY_CHANGED, "priority",
                        oldPriority, request.getPriority().name());
                task.setPriority(request.getPriority());
            }

            // ── NEW: record status change + taskCompleted notification ────────
            if (request.getStatus() != null) {
                activityService.record(taskId, projectId, requesterId,
                        Action.STATUS_CHANGED, "status",
                        oldStatus.name(), request.getStatus().name());

                if (request.getStatus() == Status.DONE && oldStatus != Status.DONE) {
                    User requester = userRepository.findById(requesterId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", requesterId));
                    // Notify project creator / task creator
                    if (task.getCreatedBy() != null &&
                            !task.getCreatedBy().getId().equals(requesterId)) {
                        notificationFacade.taskCompleted(
                                task.getCreatedBy().getId(),
                                task.getCreatedBy().getEmail(),
                                task.getCreatedBy().getName(),
                                task.getTitle(),
                                task.getProject().getName(),
                                requester.getName(),
                                taskId);
                    }
                    // ── NEW: record TASK_COMPLETED activity ──────────────────
                    activityService.record(taskId, projectId, requesterId,
                            Action.TASK_COMPLETED, null, null, null);
                }

                task.setStatus(request.getStatus());
            }

            // Handle assignee change
            if (request.getAssignedTo() != null) {
                User newAssignee = userRepository.findById(request.getAssignedTo())
                        .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssignedTo()));
                if (!memberRepository.existsByProjectIdAndUserId(projectId, newAssignee.getId())) {
                    throw new BadRequestException("Assigned user is not a project member");
                }
                User admin = userRepository.findById(requesterId).orElseThrow();
                // ── NEW: record assignee change ──────────────────────────────
                activityService.record(taskId, projectId, requesterId,
                        Action.ASSIGNED, "assignedTo",
                        oldAssignee, newAssignee.getName());
                task.setAssignedTo(newAssignee);
                publishAssignmentEvent(task, newAssignee, admin, task.getProject());
            }

        } else {

            if (task.getAssignedTo() == null ||
                    !task.getAssignedTo().getId().equals(requesterId)) {
                throw new ForbiddenException("Members can only update their own assigned tasks");
            }

            if (request.getTitle() != null
                    || request.getDescription() != null
                    || request.getDueDate() != null
                    || request.getPriority() != null
                    || request.getAssignedTo() != null) {
                throw new ForbiddenException("Members can only update task status");
            }

            if (request.getStatus() == null) {
                throw new BadRequestException("Status is required");
            }

            // ── NEW: record status change for member ─────────────────────────
            activityService.record(taskId, projectId, requesterId,
                    Action.STATUS_CHANGED, "status",
                    oldStatus.name(), request.getStatus().name());

            // ── NEW: taskCompleted notification when member marks DONE ────────
            if (request.getStatus() == Status.DONE && oldStatus != Status.DONE) {
                User requester = userRepository.findById(requesterId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", requesterId));
                if (task.getCreatedBy() != null &&
                        !task.getCreatedBy().getId().equals(requesterId)) {
                    notificationFacade.taskCompleted(
                            task.getCreatedBy().getId(),
                            task.getCreatedBy().getEmail(),
                            task.getCreatedBy().getName(),
                            task.getTitle(),
                            task.getProject().getName(),
                            requester.getName(),
                            taskId);
                }
                activityService.record(taskId, projectId, requesterId,
                        Action.TASK_COMPLETED, null, null, null);
            }

            task.setStatus(request.getStatus());
        }

        Task updated = taskRepository.save(task);
        log.info("Task {} updated by user {}", taskId, requesterId);
        return toDTO(updated);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "dashboard", allEntries = true)
    public void deleteTask(Long taskId, Long requesterId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Long projectId = task.getProject().getId();
        assertAdminRole(projectId, requesterId);

        // ── NEW: record deletion before actually deleting ────────────────────
        activityService.record(taskId, projectId, requesterId,
                Action.TASK_DELETED, null, task.getTitle(), null);

        taskRepository.deleteById(taskId);
        log.info("Task {} deleted by user {}", taskId, requesterId);
    }

    // ── Overdue scheduler ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public void checkAndPublishOverdueTasks() {
        List<Task> overdue = taskRepository.findAllOverdueTasks(LocalDate.now());
        log.info("Overdue task scan: found {} tasks", overdue.size());
        overdue.forEach(task -> {
            if (task.getAssignedTo() != null) {
                eventPublisher.publishTaskOverdue(TaskEvents.TaskOverdueEvent.builder()
                        .taskId(task.getId())
                        .taskTitle(task.getTitle())
                        .projectId(task.getProject().getId())
                        .assignedToUserId(task.getAssignedTo().getId())
                        .assignedToEmail(task.getAssignedTo().getEmail())
                        .dueDate(task.getDueDate())
                        .detectedAt(LocalDateTime.now())
                        .build());
            }
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void publishAssignmentEvent(Task task, User assignee,
                                        User assignedBy, Project project) {
        eventPublisher.publishTaskAssigned(TaskEvents.TaskAssignedEvent.builder()
                .taskId(task.getId())
                .taskTitle(task.getTitle())
                .projectId(project.getId())
                .projectName(project.getName())
                .assignedToUserId(assignee.getId())
                .assignedToEmail(assignee.getEmail())
                .assignedToName(assignee.getName())
                .assignedByUserId(assignedBy.getId())
                .assignedByName(assignedBy.getName())
                .dueDate(task.getDueDate())
                .occurredAt(LocalDateTime.now())
                .build());
    }

    private void assertMembership(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ForbiddenException("You are not a member of this project");
        }
    }

    private void assertAdminRole(Long projectId, Long userId) {
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this project"));
        if (member.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only project admins can perform this action");
        }
    }

    TaskDTO toDTO(Task task) {
        boolean overdue = task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != Status.DONE;

        AssigneeDTO assigneeDTO = null;
        if (task.getAssignedTo() != null) {
            assigneeDTO = AssigneeDTO.builder()
                    .id(task.getAssignedTo().getId())
                    .name(task.getAssignedTo().getName())
                    .email(task.getAssignedTo().getEmail())
                    .build();
        }

        AssigneeDTO creatorDTO = null;
        if (task.getCreatedBy() != null) {
            creatorDTO = AssigneeDTO.builder()
                    .id(task.getCreatedBy().getId())
                    .name(task.getCreatedBy().getName())
                    .email(task.getCreatedBy().getEmail())
                    .build();
        }

        return TaskDTO.builder()
                .id(task.getId())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .overdue(overdue)
                .assignedTo(assigneeDTO)
                .createdBy(creatorDTO)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}