package com.taskmanager.task.entity;

import com.taskmanager.task.entity.Task.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // ── Existing queries (unchanged) ─────────────────────────────────────────

    List<Task> findAllByProjectId(Long projectId);

    List<Task> findAllByProjectIdAndStatus(Long projectId, Status status);

    List<Task> findAllByProjectIdAndAssignedToId(Long projectId, Long userId);

    @Query("""
        SELECT t FROM Task t
        JOIN FETCH t.project
        LEFT JOIN FETCH t.assignedTo
        LEFT JOIN FETCH t.createdBy
        WHERE t.project.id = :projectId
        AND (:status IS NULL OR t.status = :status)
        AND (:assigneeId IS NULL OR t.assignedTo.id = :assigneeId)
        ORDER BY t.createdAt DESC
        """)
    List<Task> findTasksFiltered(@Param("projectId") Long projectId,
                                 @Param("status") Status status,
                                 @Param("assigneeId") Long assigneeId);

    @Query("""
        SELECT COUNT(t) FROM Task t
        WHERE t.project.id IN (
            SELECT pm.project.id FROM ProjectMember pm WHERE pm.user.id = :userId
        )
        """)
    long countTasksForUser(@Param("userId") Long userId);

    @Query("""
        SELECT t.status AS status, COUNT(t) AS count FROM Task t
        WHERE t.project.id IN (
            SELECT pm.project.id FROM ProjectMember pm WHERE pm.user.id = :userId
        )
        GROUP BY t.status
        """)
    List<Object[]> countTasksByStatusForUser(@Param("userId") Long userId);

    @Query("""
        SELECT t.assignedTo.id AS userId,
               t.assignedTo.name AS userName,
               COUNT(t) AS taskCount
        FROM Task t
        WHERE t.project.id = :projectId
        AND t.assignedTo IS NOT NULL
        GROUP BY t.assignedTo.id, t.assignedTo.name
        """)
    List<Object[]> countTasksPerUserInProject(@Param("projectId") Long projectId);

    @Query("""
        SELECT t FROM Task t
        LEFT JOIN FETCH t.assignedTo
        WHERE t.project.id IN (
            SELECT pm.project.id FROM ProjectMember pm WHERE pm.user.id = :userId
        )
        AND t.dueDate < :today
        AND t.status != 'DONE'
        ORDER BY t.dueDate ASC
        """)
    List<Task> findOverdueTasksForUser(@Param("userId") Long userId,
                                       @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findAllOverdueTasks(@Param("today") LocalDate today);

    // ── Kanban additions (Phase 3) ────────────────────────────────────────────

    List<Task> findByKanbanColumnId(Long kanbanColumnId);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId " +
            "ORDER BY t.kanbanPosition ASC")
    List<Task> findByProjectIdOrderByKanbanPosition(@Param("projectId") Long projectId);

    // ── Analytics additions (Phase 3) ─────────────────────────────────────────

    @Query("SELECT t.status, COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId GROUP BY t.status")
    List<Object[]> countTasksByStatusForProject(@Param("projectId") Long projectId);

    @Query("SELECT t.priority, COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId GROUP BY t.priority")
    List<Object[]> countTasksByPriorityForProject(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId " +
            "AND t.dueDate < :today AND t.status <> 'DONE'")
    long countOverdueTasksForProject(@Param("projectId") Long projectId,
                                     @Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId " +
            "AND t.status = 'DONE' AND t.updatedAt >= :since")
    long countCompletedSince(@Param("projectId") Long projectId,
                             @Param("since") LocalDate since);

    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId " +
            "AND t.status = 'DONE' " +
            "AND t.updatedAt >= :from AND t.updatedAt <= :to")
    long countCompletedBetween(@Param("projectId") Long projectId,
                               @Param("from") LocalDate from,
                               @Param("to") LocalDate to);

    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId " +
            "AND t.createdAt >= :from AND t.createdAt <= :to")
    long countCreatedBetween(@Param("projectId") Long projectId,
                             @Param("from") LocalDate from,
                             @Param("to") LocalDate to);

    @Query("""
           SELECT u.id, u.name,
                  COUNT(t),
                  SUM(CASE WHEN t.status = 'DONE' THEN 1 ELSE 0 END)
           FROM Task t
           JOIN t.assignedTo u
           WHERE t.project.id = :projectId
           GROUP BY u.id, u.name
           """)
    List<Object[]> countTasksByAssigneeForProject(@Param("projectId") Long projectId);
}