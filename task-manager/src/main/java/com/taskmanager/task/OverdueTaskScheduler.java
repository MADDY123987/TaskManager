package com.taskmanager.task;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OverdueTaskScheduler {

    private final TaskService taskService;

    /**
     * Runs every 30 minutes.
     * Scans all non-DONE tasks past due_date and publishes overdue events.
     */
    @Scheduled(fixedDelay = 30 * 60 * 1000, initialDelay = 5 * 60 * 1000)
    public void scanOverdueTasks() {
        log.info("Running overdue task scan...");
        try {
            taskService.checkAndPublishOverdueTasks();
        } catch (Exception ex) {
            log.error("Overdue scan failed: {}", ex.getMessage());
        }
    }
}
