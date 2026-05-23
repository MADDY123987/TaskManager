package com.taskmanager.kanban;

import com.taskmanager.activity.ActivityService;
import com.taskmanager.exception.*;
import com.taskmanager.kanban.entity.KanbanColumn;
import com.taskmanager.kanban.entity.KanbanColumnRepository;
import com.taskmanager.project.entity.ProjectMemberRepository;
import com.taskmanager.project.entity.ProjectMember.Role;
import com.taskmanager.task.entity.Task;
import com.taskmanager.task.entity.TaskRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KanbanService {

    private final KanbanColumnRepository columnRepository;
    private final TaskRepository         taskRepository;
    private final ProjectMemberRepository memberRepository;
    private final ActivityService        activityService;

    // ── Default columns seeded when a project is created ─────────────────────

    @Transactional
    public void seedDefaultColumns(Long projectId) {
        if (columnRepository.countByProjectId(projectId) == 0) {
            List<String[]> defaults = List.of(
                    new String[]{"To Do",       "#6B7280"},
                    new String[]{"In Progress", "#3B82F6"},
                    new String[]{"In Review",   "#F59E0B"},
                    new String[]{"Done",        "#10B981"}
            );
            for (int i = 0; i < defaults.size(); i++) {
                columnRepository.save(KanbanColumn.builder()
                        .projectId(projectId)
                        .name(defaults.get(i)[0])
                        .color(defaults.get(i)[1])
                        .position(i)
                        .build());
            }
        }
    }

    // ── List columns ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ColumnDTO> getColumns(Long projectId, Long userId) {
        assertMembership(projectId, userId);
        return columnRepository.findByProjectIdOrderByPosition(projectId)
                .stream().map(this::toColumnDTO).collect(Collectors.toList());
    }

    // ── Add column ────────────────────────────────────────────────────────────

    @Transactional
    public ColumnDTO addColumn(Long projectId, Long userId, @Valid CreateColumnRequest req) {
        assertAdminRole(projectId, userId);
        if (columnRepository.existsByProjectIdAndName(projectId, req.getName())) {
            throw new BadRequestException("Column '" + req.getName() + "' already exists");
        }
        int nextPos = (int) columnRepository.countByProjectId(projectId);
        KanbanColumn col = KanbanColumn.builder()
                .projectId(projectId)
                .name(req.getName())
                .color(req.getColor())
                .position(nextPos)
                .build();
        return toColumnDTO(columnRepository.save(col));
    }

    // ── Rename / recolor column ───────────────────────────────────────────────

    @Transactional
    public ColumnDTO updateColumn(Long projectId, Long columnId, Long userId,
                                  UpdateColumnRequest req) {
        assertAdminRole(projectId, userId);
        KanbanColumn col = columnRepository.findById(columnId)
                .filter(c -> c.getProjectId().equals(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("KanbanColumn", columnId));
        if (req.getName()  != null) col.setName(req.getName());
        if (req.getColor() != null) col.setColor(req.getColor());
        return toColumnDTO(columnRepository.save(col));
    }

    // ── Delete column ─────────────────────────────────────────────────────────

    @Transactional
    public void deleteColumn(Long projectId, Long columnId, Long userId) {
        assertAdminRole(projectId, userId);
        KanbanColumn col = columnRepository.findById(columnId)
                .filter(c -> c.getProjectId().equals(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("KanbanColumn", columnId));
        // Nullify tasks that were in this column
        taskRepository.findByKanbanColumnId(columnId)
                .forEach(t -> { t.setKanbanColumnId(null); taskRepository.save(t); });
        columnRepository.deleteById(columnId);
    }

    // ── Reorder columns ───────────────────────────────────────────────────────

    @Transactional
    public List<ColumnDTO> reorderColumns(Long projectId, Long userId,
                                          List<Long> orderedColumnIds) {
        assertAdminRole(projectId, userId);
        for (int i = 0; i < orderedColumnIds.size(); i++) {
            columnRepository.updatePosition(orderedColumnIds.get(i), i);
        }
        return getColumns(projectId, userId);
    }

    // ── Move task to column (drag-and-drop) ───────────────────────────────────

    @Transactional
    @CacheEvict(value = "dashboard", allEntries = true)
    public void moveTask(Long projectId, Long taskId, Long columnId,
                         int position, Long userId) {
        assertMembership(projectId, userId);

        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getProject().getId().equals(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        KanbanColumn col = columnRepository.findById(columnId)
                .filter(c -> c.getProjectId().equals(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("KanbanColumn", columnId));

        String oldCol = task.getKanbanColumnId() != null
                ? columnRepository.findById(task.getKanbanColumnId())
                  .map(KanbanColumn::getName).orElse("none")
                : "none";

        task.setKanbanColumnId(columnId);
        task.setKanbanPosition(position);
        taskRepository.save(task);

        activityService.record(taskId, projectId, userId,
                ActivityService.Action.TASK_UPDATED,
                "kanban_column", oldCol, col.getName());
        log.info("Task {} moved to column '{}' at position {} by user {}",
                taskId, col.getName(), position, userId);
    }

    // ── Full board view ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public BoardDTO getBoard(Long projectId, Long userId) {
        assertMembership(projectId, userId);
        List<ColumnDTO> columns = getColumns(projectId, userId);

        List<Task> tasks = taskRepository.findByProjectIdOrderByKanbanPosition(projectId);

        // Group tasks per column
        columns.forEach(col ->
                col.setTasks(tasks.stream()
                        .filter(t -> col.getId().equals(t.getKanbanColumnId()))
                        .map(this::toTaskCard)
                        .collect(Collectors.toList()))
        );

        return BoardDTO.builder()
                .projectId(projectId)
                .columns(columns)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void assertMembership(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId))
            throw new ForbiddenException("You are not a member of this project");
    }

    private void assertAdminRole(Long projectId, Long userId) {
        memberRepository.findByProjectIdAndUserId(projectId, userId)
                .filter(m -> m.getRole() == Role.ADMIN)
                .orElseThrow(() -> new ForbiddenException("Only admins can manage the board"));
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BoardDTO {
        private Long projectId;
        private List<ColumnDTO> columns;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ColumnDTO {
        private Long   id;
        private String name;
        private int    position;
        private String color;
        private List<TaskCardDTO> tasks;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TaskCardDTO {
        private Long   id;
        private String title;
        private String priority;
        private String status;
        private int    position;
        private String assigneeName;
        private String assigneeAvatarUrl;
        private java.time.LocalDate dueDate;
        private boolean overdue;
    }

    @Data
    public static class CreateColumnRequest {
        @NotBlank @Size(max = 100)
        private String name;
        @Size(max = 20)
        private String color;
    }

    @Data
    public static class UpdateColumnRequest {
        @Size(max = 100) private String name;
        @Size(max = 20)  private String color;
    }

    @Data
    public static class MoveTaskRequest {
        @NotNull private Long columnId;
        @Min(0)  private int  position;
    }

    private ColumnDTO toColumnDTO(KanbanColumn c) {
        return ColumnDTO.builder()
                .id(c.getId()).name(c.getName())
                .position(c.getPosition()).color(c.getColor())
                .tasks(List.of())   // populated in getBoard()
                .build();
    }

    private TaskCardDTO toTaskCard(Task t) {
        boolean overdue = t.getDueDate() != null
                && t.getDueDate().isBefore(java.time.LocalDate.now())
                && t.getStatus() != Task.Status.DONE;
        return TaskCardDTO.builder()
                .id(t.getId())
                .title(t.getTitle())
                .priority(t.getPriority() != null ? t.getPriority().name() : null)
                .status(t.getStatus().name())
                .position(t.getKanbanPosition())
                .assigneeName(t.getAssignedTo() != null ? t.getAssignedTo().getName() : null)
                .assigneeAvatarUrl(t.getAssignedTo() != null ? t.getAssignedTo().getAvatarUrl() : null)
                .dueDate(t.getDueDate())
                .overdue(overdue)
                .build();
    }
}
