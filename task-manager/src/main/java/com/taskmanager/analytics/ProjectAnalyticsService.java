package com.taskmanager.analytics;


import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.project.entity.ProjectMemberRepository;
import com.taskmanager.task.entity.Task.Status;
import com.taskmanager.task.entity.TaskRepository;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectAnalyticsService {

    private final TaskRepository          taskRepository;
    private final ProjectMemberRepository memberRepository;

    // ── Full analytics snapshot ───────────────────────────────────────────────

    @Cacheable(value = "projectAnalytics", key = "#projectId + ':' + #userId")
    @Transactional(readOnly = true)
    public ProjectAnalyticsDTO getAnalytics(Long projectId, Long userId) {
        assertMembership(projectId, userId);

        // Task counts by status
        Map<String, Long> byStatus = new HashMap<>();
        for (Status s : Status.values()) byStatus.put(s.name(), 0L);
        taskRepository.countTasksByStatusForProject(projectId).forEach(row ->
                byStatus.put(row[0].toString(), (Long) row[1]));

        // Task counts by priority
        Map<String, Long> byPriority = new HashMap<>();
        taskRepository.countTasksByPriorityForProject(projectId).forEach(row ->
                byPriority.put(row[0].toString(), (Long) row[1]));

        // Overdue
        long overdueCount = taskRepository.countOverdueTasksForProject(projectId, LocalDate.now());

        // Completed this week / month
        long completedThisWeek  = taskRepository.countCompletedSince(
                projectId, LocalDate.now().minusWeeks(1));
        long completedThisMonth = taskRepository.countCompletedSince(
                projectId, LocalDate.now().minusMonths(1));

        // Total tasks
        long totalTasks = byStatus.values().stream().mapToLong(Long::longValue).sum();

        // Completion rate %
        double completionRate = totalTasks == 0 ? 0 :
                (byStatus.getOrDefault("DONE", 0L) * 100.0) / totalTasks;

        // Per-member stats
        List<MemberStatDTO> memberStats = taskRepository
                .countTasksByAssigneeForProject(projectId)
                .stream()
                .map(row -> MemberStatDTO.builder()
                        .userId((Long)   row[0])
                        .memberName((String) row[1])
                        .totalAssigned((Long) row[2])
                        .totalCompleted((Long) row[3])
                        .build())
                .collect(Collectors.toList());

        // Weekly task completion trend (last 8 weeks)
        List<WeeklyTrendDTO> weeklyTrend = buildWeeklyTrend(projectId);

        return ProjectAnalyticsDTO.builder()
                .projectId(projectId)
                .totalTasks(totalTasks)
                .tasksByStatus(byStatus)
                .tasksByPriority(byPriority)
                .overdueCount(overdueCount)
                .completedThisWeek(completedThisWeek)
                .completedThisMonth(completedThisMonth)
                .completionRate(Math.round(completionRate * 10.0) / 10.0)
                .memberStats(memberStats)
                .weeklyTrend(weeklyTrend)
                .generatedAt(LocalDate.now())
                .build();
    }

    // ── Weekly trend (last 8 weeks) ───────────────────────────────────────────

    private List<WeeklyTrendDTO> buildWeeklyTrend(Long projectId) {
        List<WeeklyTrendDTO> trend = new ArrayList<>();
        for (int i = 7; i >= 0; i--) {
            LocalDate weekStart = LocalDate.now().minusWeeks(i).with(
                    java.time.DayOfWeek.MONDAY);
            LocalDate weekEnd   = weekStart.plusDays(6);
            long completed = taskRepository.countCompletedBetween(projectId, weekStart, weekEnd);
            long created   = taskRepository.countCreatedBetween(projectId, weekStart, weekEnd);
            trend.add(WeeklyTrendDTO.builder()
                    .weekStart(weekStart)
                    .weekEnd(weekEnd)
                    .completed(completed)
                    .created(created)
                    .build());
        }
        return trend;
    }

    private void assertMembership(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId))
            throw new ForbiddenException("You are not a member of this project");
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProjectAnalyticsDTO {
        private Long                    projectId;
        private long                    totalTasks;
        private Map<String, Long>       tasksByStatus;
        private Map<String, Long>       tasksByPriority;
        private long                    overdueCount;
        private long                    completedThisWeek;
        private long                    completedThisMonth;
        private double                  completionRate;
        private List<MemberStatDTO>     memberStats;
        private List<WeeklyTrendDTO>    weeklyTrend;
        private LocalDate               generatedAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MemberStatDTO {
        private Long   userId;
        private String memberName;
        private long   totalAssigned;
        private long   totalCompleted;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class WeeklyTrendDTO {
        private LocalDate weekStart;
        private LocalDate weekEnd;
        private long      completed;
        private long      created;
    }
}
