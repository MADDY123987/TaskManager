package com.taskmanager.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TaskEventConsumer {

    /**
     * Handles task assignment notifications.
     * In production: send email via SendGrid / SES / JavaMailSender.
     * Currently logs for demo purposes.
     */
    @RabbitListener(queues = "${rabbitmq.queues.task-assigned}")
    public void handleTaskAssigned(TaskEvents.TaskAssignedEvent event) {
        try {
            log.info("[NOTIFICATION] Task '{}' assigned to {} by {} — due: {}",
                    event.getTaskTitle(),
                    event.getAssignedToName(),
                    event.getAssignedByName(),
                    event.getDueDate());

            // TODO: plug in email service here
            // emailService.sendTaskAssignedEmail(event);

        } catch (Exception ex) {
            log.error("Error processing task.assigned event for task {}: {}",
                    event.getTaskId(), ex.getMessage());
            throw ex; // re-throw so RabbitMQ sends to DLQ after retries
        }
    }

    /**
     * Handles overdue task notifications.
     */
    @RabbitListener(queues = "${rabbitmq.queues.task-overdue}")
    public void handleTaskOverdue(TaskEvents.TaskOverdueEvent event) {
        try {
            log.warn("[OVERDUE] Task '{}' (id={}) assigned to {} was due on {}",
                    event.getTaskTitle(),
                    event.getTaskId(),
                    event.getAssignedToEmail(),
                    event.getDueDate());

            // TODO: send overdue notification email

        } catch (Exception ex) {
            log.error("Error processing task.overdue event for task {}: {}",
                    event.getTaskId(), ex.getMessage());
            throw ex;
        }
    }
}
