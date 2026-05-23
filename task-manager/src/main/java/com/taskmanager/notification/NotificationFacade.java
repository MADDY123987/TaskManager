package com.taskmanager.notification;


import com.taskmanager.notification.entity.Notification.ReferenceType;
import com.taskmanager.notification.entity.Notification.Type;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**a
 * Single entry-point that fires BOTH the in-app notification AND the email.
 * Call this from TaskService, ProjectService, TaskEventConsumer, etc.
 * Every public method is fire-and-forget safe — errors are logged, never re-thrown.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationFacade {

    private final NotificationService notificationService;
    private final EmailService emailService;

    // ── Task assigned ────────────────────────────────────────────────────────

    public void taskAssigned(Long assigneeUserId, String assigneeEmail, String assigneeName,
                             String taskTitle, String projectName, String assignedByName,
                             LocalDate dueDate, Long taskId) {
        try {
            notificationService.create(
                    assigneeUserId, Type.TASK_ASSIGNED,
                    "Task assigned: " + taskTitle,
                    assignedByName + " assigned you to '" + taskTitle + "' in " + projectName,
                    ReferenceType.TASK, taskId);

            emailService.sendTaskAssigned(
                    assigneeEmail, assigneeName,
                    taskTitle, projectName,
                    assignedByName, dueDate, taskId);
        } catch (Exception ex) {
            log.error("NotificationFacade.taskAssigned failed: {}", ex.getMessage());
        }
    }

    // ── Task completed ───────────────────────────────────────────────────────

    public void taskCompleted(Long projectOwnerId, String ownerEmail, String ownerName,
                              String taskTitle, String projectName,
                              String completedByName, Long taskId) {
        try {
            notificationService.create(
                    projectOwnerId, Type.TASK_COMPLETED,
                    "Task completed: " + taskTitle,
                    completedByName + " completed '" + taskTitle + "' in " + projectName,
                    ReferenceType.TASK, taskId);

            emailService.sendTaskCompleted(
                    ownerEmail, ownerName,
                    taskTitle, projectName,
                    completedByName, taskId);
        } catch (Exception ex) {
            log.error("NotificationFacade.taskCompleted failed: {}", ex.getMessage());
        }
    }

    // ── Task overdue ─────────────────────────────────────────────────────────

    public void taskOverdue(Long assigneeUserId, String assigneeEmail, String assigneeName,
                            String taskTitle, String projectName,
                            LocalDate dueDate, Long taskId) {
        try {
            notificationService.create(
                    assigneeUserId, Type.TASK_OVERDUE,
                    "Overdue: " + taskTitle,
                    "'" + taskTitle + "' in " + projectName + " was due " + dueDate,
                    ReferenceType.TASK, taskId);

            emailService.sendTaskOverdue(
                    assigneeEmail, assigneeName,
                    taskTitle, projectName,
                    dueDate, taskId);
        } catch (Exception ex) {
            log.error("NotificationFacade.taskOverdue failed: {}", ex.getMessage());
        }
    }

    // ── Member added ─────────────────────────────────────────────────────────

    public void memberAdded(Long newMemberUserId, String memberEmail, String memberName,
                            String projectName, String addedByName,
                            String role, Long projectId) {
        try {
            notificationService.create(
                    newMemberUserId, Type.MEMBER_ADDED,
                    "Added to project: " + projectName,
                    addedByName + " added you to '" + projectName + "' as " + role,
                    ReferenceType.PROJECT, projectId);

            emailService.sendMemberAdded(
                    memberEmail, memberName,
                    projectName, addedByName,
                    role, projectId);
        } catch (Exception ex) {
            log.error("NotificationFacade.memberAdded failed: {}", ex.getMessage());
        }
    }

    // ── Comment added ────────────────────────────────────────────────────────

    public void commentAdded(Long taskAssigneeUserId, String assigneeEmail, String assigneeName,
                             String taskTitle, String commenterName,
                             String commentContent, Long taskId) {
        try {
            notificationService.create(
                    taskAssigneeUserId, Type.COMMENT_ADDED,
                    commenterName + " commented on: " + taskTitle,
                    commenterName + ": " + (commentContent.length() > 120
                            ? commentContent.substring(0, 120) + "…" : commentContent),
                    ReferenceType.TASK, taskId);

            emailService.sendCommentAdded(
                    assigneeEmail, assigneeName,
                    taskTitle, commenterName,
                    commentContent, taskId);
        } catch (Exception ex) {
            log.error("NotificationFacade.commentAdded failed: {}", ex.getMessage());
        }
    }
}
