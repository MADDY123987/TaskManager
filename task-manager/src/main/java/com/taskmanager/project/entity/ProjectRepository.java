package com.taskmanager.project.entity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT DISTINCT p FROM Project p JOIN p.members m WHERE m.user.id = :userId")
    List<Project> findAllByMemberUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Project p JOIN FETCH p.members m JOIN FETCH m.user WHERE p.id = :id")
    Optional<Project> findByIdWithMembers(@Param("id") Long id);
}
