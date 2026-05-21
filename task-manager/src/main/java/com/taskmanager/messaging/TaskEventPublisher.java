package com.taskmanager.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TaskEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchanges.task-events}")
    private String exchange;

    @Value("${rabbitmq.routing-keys.task-assigned}")
    private String taskAssignedKey;

    @Value("${rabbitmq.routing-keys.task-overdue}")
    private String taskOverdueKey;

    public void publishTaskAssigned(TaskEvents.TaskAssignedEvent event) {
        try {
            rabbitTemplate.convertAndSend(exchange, taskAssignedKey, event);
            log.info("Published task.assigned event for task {} to user {}",
                    event.getTaskId(), event.getAssignedToEmail());
        } catch (Exception ex) {
            // Log but don't fail the main operation
            log.error("Failed to publish task.assigned event for task {}: {}",
                    event.getTaskId(), ex.getMessage());
        }
    }

    public void publishTaskOverdue(TaskEvents.TaskOverdueEvent event) {
        try {
            rabbitTemplate.convertAndSend(exchange, taskOverdueKey, event);
            log.info("Published task.overdue event for task {}", event.getTaskId());
        } catch (Exception ex) {
            log.error("Failed to publish task.overdue event for task {}: {}",
                    event.getTaskId(), ex.getMessage());
        }
    }
}
