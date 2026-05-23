package com.taskmanager.messaging;



import com.taskmanager.notification.NotificationFacade;
import com.taskmanager.websocket.WebSocketNotificationService;
import com.taskmanager.websocket.WebSocketNotificationService.WsEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class TaskEventConsumer {

    private final NotificationFacade notificationFacade;
    private final WebSocketNotificationService wsService;

    /**
     * Handles task assignment notifications.
     * - Logs the assignment (original behaviour)
     * - Creates an in-app notification + sends email (via NotificationFacade)
     * - Pushes a real-time WebSocket event to the assignee and the project channel
     */
    @RabbitListener(queues = "${rabbitmq.queues.task-assigned}")
    public void handleTaskAssigned(TaskEvents.TaskAssignedEvent event) {
        try {
            // Original log
            log.info("[NOTIFICATION] Task '{}' assigned to {} by {} — due: {}",
                    event.getTaskTitle(),
                    event.getAssignedToName(),
                    event.getAssignedByName(),
                    event.getDueDate());

            // In-app notification + email
            notificationFacade.taskAssigned(
                    event.getAssignedToUserId(),
                    event.getAssignedToEmail(),
                    event.getAssignedToName(),
                    event.getTaskTitle(),
                    event.getProjectName(),
                    event.getAssignedByName(),
                    event.getDueDate(),
                    event.getTaskId());

            // Real-time WebSocket push to assignee and project board
            WsEvent wsEvent = WsEvent.builder()
                    .type("TASK_ASSIGNED")
                    .referenceId(event.getTaskId())
                    .projectId(event.getProjectId())
                    .payload(event)
                    .timestamp(LocalDateTime.now())
                    .build();

            wsService.pushToUser(event.getAssignedToUserId(), wsEvent);
            wsService.pushToProject(event.getProjectId(), wsEvent);

        } catch (Exception ex) {
            log.error("Error processing task.assigned event for task {}: {}",
                    event.getTaskId(), ex.getMessage());
            throw ex; // re-throw so RabbitMQ sends to DLQ after retries
        }
    }

    /**
     * Handles overdue task notifications.
     * - Logs the overdue task (original behaviour)
     * - Creates an in-app notification + sends email (via NotificationFacade)
     * - Pushes a real-time WebSocket event to the assignee
     */
    @RabbitListener(queues = "${rabbitmq.queues.task-overdue}")
    public void handleTaskOverdue(TaskEvents.TaskOverdueEvent event) {
        try {
            // Original log
            log.warn("[OVERDUE] Task '{}' (id={}) assigned to {} was due on {}",
                    event.getTaskTitle(),
                    event.getTaskId(),
                    event.getAssignedToEmail(),
                    event.getDueDate());

            // In-app notification + email
            notificationFacade.taskOverdue(
                    event.getAssignedToUserId(),
                    event.getAssignedToEmail(),
                    null,       // assigneeName — add to TaskOverdueEvent if needed
                    event.getTaskTitle(),
                    null,       // projectName  — add to TaskOverdueEvent if needed
                    event.getDueDate(),
                    event.getTaskId());

            // Real-time WebSocket push to assignee only
            WsEvent wsEvent = WsEvent.builder()
                    .type("TASK_OVERDUE")
                    .referenceId(event.getTaskId())
                    .projectId(event.getProjectId())
                    .payload(event)
                    .timestamp(LocalDateTime.now())
                    .build();

            wsService.pushToUser(event.getAssignedToUserId(), wsEvent);

        } catch (Exception ex) {
            log.error("Error processing task.overdue event for task {}: {}",
                    event.getTaskId(), ex.getMessage());
            throw ex; // re-throw so RabbitMQ sends to DLQ after retries
        }
    }
}