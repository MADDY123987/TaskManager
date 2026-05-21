package com.taskmanager.security;

import com.taskmanager.project.entity.ProjectMemberRepository;
import com.taskmanager.project.entity.ProjectMember.Role;
import com.taskmanager.task.entity.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("taskSecurityService")
@RequiredArgsConstructor
public class TaskSecurityService {

    private final TaskRepository taskRepository;
    private final ProjectMemberRepository memberRepository;

    @Transactional(readOnly = true)
    public boolean isAssignee(Long taskId, Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return taskRepository.findById(taskId)
                .map(t -> t.getAssignedTo() != null && t.getAssignedTo().getId().equals(principal.getId()))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isProjectAdmin(Long projectId, Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return memberRepository.findByProjectIdAndUserId(projectId, principal.getId())
                .map(m -> m.getRole() == Role.ADMIN)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isProjectMember(Long projectId, Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return memberRepository.existsByProjectIdAndUserId(projectId, principal.getId());
    }

    @Transactional(readOnly = true)
    public boolean canUpdateTask(Long taskId, Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return taskRepository.findById(taskId).map(task -> {
            Long projectId = task.getProject().getId();
            return memberRepository.findByProjectIdAndUserId(projectId, principal.getId())
                    .map(m -> m.getRole() == Role.ADMIN ||
                            (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(principal.getId())))
                    .orElse(false);
        }).orElse(false);
    }
}
