package com.taskmanager.kanban.entity;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface KanbanColumnRepository extends JpaRepository<KanbanColumn, Long> {

    List<KanbanColumn> findByProjectIdOrderByPosition(Long projectId);

    Optional<KanbanColumn> findByProjectIdAndName(Long projectId, String name);

    boolean existsByProjectIdAndName(Long projectId, String name);

    @Modifying
    @Query("UPDATE KanbanColumn c SET c.position = :position WHERE c.id = :id")
    void updatePosition(@Param("id") Long id, @Param("position") int position);

    long countByProjectId(Long projectId);
}
