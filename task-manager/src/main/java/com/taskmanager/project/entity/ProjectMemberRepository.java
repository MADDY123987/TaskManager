package com.taskmanager.project.entity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    List<ProjectMember> findAllByProjectId(Long projectId);

    void deleteByProjectIdAndUserId(Long projectId, Long userId);

    @Query("SELECT m FROM ProjectMember m JOIN FETCH m.user WHERE m.project.id = :projectId")
    List<ProjectMember> findMembersWithUsers(@Param("projectId") Long projectId);
}
