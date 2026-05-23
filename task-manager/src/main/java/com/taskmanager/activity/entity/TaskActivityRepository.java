package com.taskmanager.activity.entity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskActivityRepository extends JpaRepository<TaskActivity, Long> {
    Page<TaskActivity> findByTaskIdOrderByOccurredAtDesc(Long taskId, Pageable pageable);
    Page<TaskActivity> findByProjectIdOrderByOccurredAtDesc(Long projectId, Pageable pageable);
}
