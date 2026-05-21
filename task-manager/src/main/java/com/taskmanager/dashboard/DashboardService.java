package com.taskmanager.dashboard;

import com.taskmanager.task.entity.Task.Status;
import com.taskmanager.task.entity.TaskRepository;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final TaskRepository taskRepository;

    @CircuitBreaker(name = "dashboardService", fallbackMethod = "getDashboardFallback")
    @Retry(name = "dashboardService")
    @Bulkhead(name = "dashboardService")
    @Cacheable(value = "dashboard", key = "#userId")
    @Transactional(readOnly = true)
    public DashboardDTO getDashboard(Long userId) {
        long totalTasks = taskRepository.countTasksForUser(userId);

        // Tasks by status
        Map<String, Long> tasksByStatus = new HashMap<>();
        for (Status s : Status.values()) tasksByStatus.put(s.name(), 0L);
        taskRepository.countTasksByStatusForUser(userId).forEach(row ->
                tasksByStatus.put(row[0].toString(), (Long) row[1]));

        // Overdue tasks
        List<OverdueTaskDTO> overdueTasks = taskRepository
                .findOverdueTasksForUser(userId, LocalDate.now())
                .stream()
                .map(t -> OverdueTaskDTO.builder()
                        .taskId(t.getId())
                        .title(t.getTitle())
                        .projectId(t.getProject().getId())
                        .projectName(t.getProject().getName())
                        .dueDate(t.getDueDate())
                        .priority(t.getPriority().name())
                        .assigneeName(t.getAssignedTo() != null ? t.getAssignedTo().getName() : null)
                        .build())
                .collect(Collectors.toList());

        return DashboardDTO.builder()
                .totalTasks(totalTasks)
                .tasksByStatus(tasksByStatus)
                .overdueCount((long) overdueTasks.size())
                .overdueTasks(overdueTasks)
                .build();
    }

    public DashboardDTO getDashboardFallback(Long userId, Exception ex) {
        log.warn("Dashboard circuit breaker open for user {}: {}", userId, ex.getMessage());
        return DashboardDTO.builder()
                .totalTasks(0L)
                .tasksByStatus(Map.of("TODO", 0L, "IN_PROGRESS", 0L, "DONE", 0L))
                .overdueCount(0L)
                .overdueTasks(List.of())
                .degraded(true)
                .build();
    }

    @CacheEvict(value = "dashboard", allEntries = true)
    public void evictCache() {
        log.debug("Dashboard cache evicted");
    }

    // ── DTOs ────────────────────────────────────────────────────────────────
    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class DashboardDTO {
        private long totalTasks;
        private Map<String, Long> tasksByStatus;
        private long overdueCount;
        private List<OverdueTaskDTO> overdueTasks;
        @Builder.Default
        private boolean degraded = false;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class OverdueTaskDTO {
        private Long taskId;
        private String title;
        private Long projectId;
        private String projectName;
        private LocalDate dueDate;
        private String priority;
        private String assigneeName;
    }
}
