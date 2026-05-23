package com.taskmanager.project;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.audit.AuditService;
import com.taskmanager.audit.entity.AuditLog;
import com.taskmanager.auth.entity.UserRepository;
import com.taskmanager.exception.*;
import com.taskmanager.notification.NotificationFacade;
import com.taskmanager.project.entity.*;
import com.taskmanager.project.entity.ProjectMember.Role;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectSettingsService {

    private final ProjectRepository       projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository          userRepository;
    private final AuditService            auditService;
    private final NotificationFacade      notificationFacade;
    private final ObjectMapper            objectMapper;

    // ── Get settings ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings(Long projectId, Long userId) {
        assertAdminRole(projectId, userId);
        Project p = getProject(projectId);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> settings = p.getSettings() != null
                    ? objectMapper.readValue(p.getSettings(), Map.class)
                    : Map.of();
            return settings;
        } catch (Exception ex) {
            return Map.of();
        }
    }

    // ── Update settings (arbitrary JSON) ─────────────────────────────────────

    @Transactional
    @CacheEvict(value = {"projects", "dashboard"}, allEntries = true)
    public Map<String, Object> updateSettings(Long projectId, Long userId,
                                              Map<String, Object> settings) {
        assertAdminRole(projectId, userId);
        Project p = getProject(projectId);
        try {
            p.setSettings(objectMapper.writeValueAsString(settings));
        } catch (Exception ex) {
            throw new BadRequestException("Invalid settings JSON");
        }
        projectRepository.save(p);
        auditService.log(userId, null, AuditLog.EntityType.PROJECT, projectId,
                AuditLog.Action.UPDATE, "Project settings updated");
        return settings;
    }

    // ── Archive ───────────────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = {"projects", "dashboard"}, allEntries = true)
    public void archiveProject(Long projectId, Long userId) {
        assertAdminRole(projectId, userId);
        Project p = getProject(projectId);
        if (p.isArchived()) throw new BadRequestException("Project is already archived");

        p.setArchived(true);
        p.setArchivedAt(LocalDateTime.now());
        projectRepository.save(p);

        auditService.log(userId, null, AuditLog.EntityType.PROJECT, projectId,
                AuditLog.Action.ARCHIVE, "Project archived");
        log.info("Project {} archived by user {}", projectId, userId);
    }

    // ── Restore ───────────────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = {"projects", "dashboard"}, allEntries = true)
    public void restoreProject(Long projectId, Long userId) {
        assertAdminRole(projectId, userId);
        Project p = getProject(projectId);
        if (!p.isArchived()) throw new BadRequestException("Project is not archived");

        p.setArchived(false);
        p.setArchivedAt(null);
        projectRepository.save(p);

        auditService.log(userId, null, AuditLog.EntityType.PROJECT, projectId,
                AuditLog.Action.UPDATE, "Project restored from archive");
        log.info("Project {} restored by user {}", projectId, userId);
    }

    // ── Transfer ownership ────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = {"projects", "projectMembers"}, allEntries = true)
    public void transferOwnership(Long projectId, Long currentOwnerId, Long newOwnerId) {
        assertAdminRole(projectId, currentOwnerId);

        if (currentOwnerId.equals(newOwnerId)) {
            throw new BadRequestException("You are already the owner");
        }

        // New owner must be a project member
        ProjectMember newOwnerMember = memberRepository
                .findByProjectIdAndUserId(projectId, newOwnerId)
                .orElseThrow(() -> new BadRequestException("Target user is not a project member"));

        // Promote new owner to ADMIN
        newOwnerMember.setRole(Role.ADMIN);
        memberRepository.save(newOwnerMember);

        // Update project owner field
        Project p = getProject(projectId);
        p.setOwnerId(newOwnerId);
        projectRepository.save(p);

        // Notify new owner
        var newOwner = userRepository.findById(newOwnerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", newOwnerId));
        var oldOwner = userRepository.findById(currentOwnerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", currentOwnerId));

        notificationFacade.memberAdded(
                newOwnerId, newOwner.getEmail(), newOwner.getName(),
                p.getName(), oldOwner.getName(), "OWNER", projectId);

        auditService.log(currentOwnerId, oldOwner.getEmail(),
                AuditLog.EntityType.PROJECT, projectId,
                AuditLog.Action.TRANSFER_OWNERSHIP,
                "Ownership transferred to user " + newOwnerId);

        log.info("Project {} ownership transferred from user {} to user {}",
                projectId, currentOwnerId, newOwnerId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Project getProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
    }

    private void assertAdminRole(Long projectId, Long userId) {
        memberRepository.findByProjectIdAndUserId(projectId, userId)
                .filter(m -> m.getRole() == Role.ADMIN)
                .orElseThrow(() -> new ForbiddenException("Only project admins can perform this action"));
    }
}
