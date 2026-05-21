package com.taskmanager.project;

import com.taskmanager.auth.entity.User;
import com.taskmanager.auth.entity.UserRepository;
import com.taskmanager.exception.*;
import com.taskmanager.project.dto.ProjectDTOs.*;
import com.taskmanager.project.entity.*;
import com.taskmanager.project.entity.ProjectMember.Role;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;

    @Transactional
    @CacheEvict(value = "projects", key = "#userId")
    public ProjectDTO createProject(CreateProjectRequest request, Long userId) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(creator)
                .build();

        Project saved = projectRepository.save(project);

        // Creator automatically becomes ADMIN
        ProjectMember adminMember = ProjectMember.builder()
                .project(saved)
                .user(creator)
                .role(Role.ADMIN)
                .build();
        memberRepository.save(adminMember);

        log.info("Project '{}' created by user {}", saved.getName(), userId);
        return getProjectById(saved.getId(), userId);
    }

    @CircuitBreaker(name = "projectService", fallbackMethod = "getProjectsFallback")
    @Retry(name = "projectService")
    @Cacheable(value = "projects", key = "#userId")
    @Transactional(readOnly = true)
    public List<ProjectSummaryDTO> getProjectsForUser(Long userId) {
        return projectRepository.findAllByMemberUserId(userId).stream()
                .map(p -> ProjectSummaryDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .description(p.getDescription())
                        .memberCount(p.getMembers().size())
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<ProjectSummaryDTO> getProjectsFallback(Long userId, Exception ex) {
        log.warn("Circuit breaker open for getProjects (userId={}): {}", userId, ex.getMessage());
        return List.of();
    }

    @Transactional(readOnly = true)
    public ProjectDTO getProjectById(Long projectId, Long userId) {
        Project project = projectRepository.findByIdWithMembers(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        assertMembership(projectId, userId);

        List<MemberDTO> members = project.getMembers().stream()
                .map(m -> MemberDTO.builder()
                        .userId(m.getUser().getId())
                        .name(m.getUser().getName())
                        .email(m.getUser().getEmail())
                        .role(m.getRole())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .collect(Collectors.toList());

        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .createdBy(project.getCreatedBy().getId())
                .createdByName(project.getCreatedBy().getName())
                .members(members)
                .createdAt(project.getCreatedAt())
                .build();
    }

    @Transactional
    @CacheEvict(value = {"projects", "projectMembers"}, allEntries = true)
    public MemberDTO addMember(Long projectId, AddMemberRequest request, Long adminUserId) {
        assertAdminRole(projectId, adminUserId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        User userToAdd = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));

        if (memberRepository.existsByProjectIdAndUserId(projectId, request.getUserId())) {
            throw new BadRequestException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(userToAdd)
                .role(request.getRole() != null ? request.getRole() : Role.MEMBER)
                .build();

        ProjectMember saved = memberRepository.save(member);
        log.info("User {} added to project {} by admin {}", request.getUserId(), projectId, adminUserId);

        return MemberDTO.builder()
                .userId(userToAdd.getId())
                .name(userToAdd.getName())
                .email(userToAdd.getEmail())
                .role(saved.getRole())
                .joinedAt(saved.getJoinedAt())
                .build();
    }

    @Transactional
    @CacheEvict(value = {"projects", "projectMembers"}, allEntries = true)
    public void removeMember(Long projectId, Long userId, Long adminUserId) {
        assertAdminRole(projectId, adminUserId);

        if (userId.equals(adminUserId)) {
            throw new BadRequestException("Project creator cannot remove themselves");
        }

        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ResourceNotFoundException("Member not found in project");
        }

        memberRepository.deleteByProjectIdAndUserId(projectId, userId);
        log.info("User {} removed from project {} by admin {}", userId, projectId, adminUserId);
    }

    @Transactional
    @CacheEvict(value = {"projects", "projectMembers", "dashboard"}, allEntries = true)
    public ProjectDTO updateProject(Long projectId, UpdateProjectRequest request, Long userId) {
        assertAdminRole(projectId, userId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());

        projectRepository.save(project);
        return getProjectById(projectId, userId);
    }

    @Transactional
    @CacheEvict(value = {"projects", "dashboard"}, allEntries = true)
    public void deleteProject(Long projectId, Long userId) {
        assertAdminRole(projectId, userId);
        projectRepository.deleteById(projectId);
        log.info("Project {} deleted by user {}", projectId, userId);
    }

    // ── helpers ──────────────────────────────────────────────────────────────
    private void assertMembership(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ForbiddenException("You are not a member of this project");
        }
    }

    private void assertAdminRole(Long projectId, Long userId) {
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this project"));
        if (member.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only project admins can perform this action");
        }
    }
}
