package com.taskmanager.comment.entity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {

    @Query("SELECT c FROM TaskComment c JOIN FETCH c.author " +
            "WHERE c.task.id = :taskId ORDER BY c.createdAt ASC")
    Page<TaskComment> findByTaskId(@Param("taskId") Long taskId, Pageable pageable);

    long countByTaskId(Long taskId);
}
