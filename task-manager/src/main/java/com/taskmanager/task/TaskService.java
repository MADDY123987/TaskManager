package com.taskmanager.task;

import com.taskmanager.auth.entity.User;
import com.taskmanager.auth.entity.UserRepository;
import com.taskmanager.exception.*;
import com.taskmanager.messaging.TaskEventPublisher;
import com.taskmanager.messaging.TaskEvents;
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

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final TaskEventPublisher eventPublisher;

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
            // Verify assignee is a project member
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

        return toDTO(saved);
    }

    @CircuitBreaker(name = "taskService", fallbackMethod = "getTasksFallback")
    @Retry(name = "taskService")
    @Bulkhead(name = "taskService")
    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksForProject(Long projectId, String statusStr, Long assigneeId, Long requesterId) {
        assertMembership(projectId, requesterId);

        Status status = null;
        if (statusStr != null) {
            try { status = Status.valueOf(statusStr.toUpperCase()); }
            catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status value: " + statusStr);
            }
        }

        // Members only see their own tasks
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

    @Transactional(readOnly = true)
    public TaskDTO getTaskById(Long taskId, Long requesterId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Long projectId = task.getProject().getId();
        assertMembership(projectId, requesterId);

        // Members can only see tasks assigned to them
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, requesterId)
                .orElseThrow(() -> new ForbiddenException("Not a member"));

        if (member.getRole() == Role.MEMBER &&
                (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(requesterId))) {
            throw new ForbiddenException("You can only view tasks assigned to you");
        }

        return toDTO(task);
    }

    @Transactional
    @CacheEvict(value = "dashboard", allEntries = true)
    public TaskDTO updateTask(Long taskId, UpdateTaskRequest request, Long requesterId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Long projectId = task.getProject().getId();

        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, requesterId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this project"));

        if (member.getRole() == Role.ADMIN) {
            // Admin can update everything
            if (request.getTitle() != null)       task.setTitle(request.getTitle());
            if (request.getDescription() != null) task.setDescription(request.getDescription());
            if (request.getDueDate() != null)     task.setDueDate(request.getDueDate());
            if (request.getPriority() != null)    task.setPriority(request.getPriority());
            if (request.getStatus() != null)      task.setStatus(request.getStatus());

            // Handle assignee change
            if (request.getAssignedTo() != null) {
                User newAssignee = userRepository.findById(request.getAssignedTo())
                        .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssignedTo()));
                if (!memberRepository.existsByProjectIdAndUserId(projectId, newAssignee.getId())) {
                    throw new BadRequestException("Assigned user is not a project member");
                }
                User admin = userRepository.findById(requesterId).orElseThrow();
                task.setAssignedTo(newAssignee);
                publishAssignmentEvent(task, newAssignee, admin, task.getProject());
            }
        }
        else {

            if (task.getAssignedTo() == null ||
                    !task.getAssignedTo().getId().equals(requesterId)) {
                throw new ForbiddenException(
                        "Members can only update their own assigned tasks");
            }

            // Members may ONLY modify status
            if (request.getTitle() != null
                    || request.getDescription() != null
                    || request.getDueDate() != null
                    || request.getPriority() != null
                    || request.getAssignedTo() != null) {

                throw new ForbiddenException(
                        "Members can only update task status");
            }

            if (request.getStatus() == null) {
                throw new BadRequestException(
                        "Status is required");
            }

            task.setStatus(request.getStatus());
        }

        Task updated = taskRepository.save(task);
        log.info("Task {} updated by user {}", taskId, requesterId);
        return toDTO(updated);
    }

    @Transactional
    @CacheEvict(value = "dashboard", allEntries = true)
    public void deleteTask(Long taskId, Long requesterId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        assertAdminRole(task.getProject().getId(), requesterId);
        taskRepository.deleteById(taskId);
        log.info("Task {} deleted by user {}", taskId, requesterId);
    }

    // ── overdue scheduler ────────────────────────────────────────────────────
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

    // ── helpers ──────────────────────────────────────────────────────────────
    private void publishAssignmentEvent(Task task, User assignee, User assignedBy, Project project) {
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
