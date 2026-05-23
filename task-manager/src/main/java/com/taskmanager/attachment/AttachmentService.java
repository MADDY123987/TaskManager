package com.taskmanager.attachment;


import com.taskmanager.activity.ActivityService;
import com.taskmanager.attachment.entity.TaskAttachment;
import com.taskmanager.attachment.entity.TaskAttachmentRepository;
import com.taskmanager.exception.*;
import com.taskmanager.project.entity.ProjectMemberRepository;
import com.taskmanager.project.entity.ProjectMember.Role;
import com.taskmanager.storage.StorageService;
import com.taskmanager.task.entity.Task;
import com.taskmanager.task.entity.TaskRepository;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentService {

    private final TaskAttachmentRepository attachmentRepository;
    private final TaskRepository           taskRepository;
    private final ProjectMemberRepository  memberRepository;
    private final StorageService           storageService;
    private final ActivityService          activityService;

    @Value("${app.storage.max-file-size-mb:20}")
    private int maxFileSizeMb;

    // ── Upload ────────────────────────────────────────────────────────────────

    @Transactional
    public AttachmentDTO upload(Long taskId, Long uploaderId, MultipartFile file) {
        Task task = getTaskAndAssertMembership(taskId, uploaderId);

        if (file.getSize() > (long) maxFileSizeMb * 1024 * 1024) {
            throw new BadRequestException("File exceeds maximum size of " + maxFileSizeMb + "MB");
        }

        String key = storageService.upload(file, task.getProject().getId(), taskId);

        TaskAttachment saved = attachmentRepository.save(TaskAttachment.builder()
                .taskId(taskId)
                .uploadedById(uploaderId)
                .fileName(file.getOriginalFilename())
                .storageKey(key)
                .contentType(file.getContentType())
                .sizeBytes(file.getSize())
                .build());

        activityService.record(taskId, task.getProject().getId(), uploaderId,
                ActivityService.Action.ATTACHMENT_ADDED, null, null, file.getOriginalFilename());

        log.info("Attachment {} uploaded to task {} by user {}", saved.getId(), taskId, uploaderId);
        return toDTO(saved, null);
    }

    // ── List ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttachmentDTO> list(Long taskId, Long requesterId) {
        getTaskAndAssertMembership(taskId, requesterId);
        return attachmentRepository.findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(a -> toDTO(a, storageService.generatePresignedUrl(a.getStorageKey())))
                .collect(Collectors.toList());
    }

    // ── Presigned download URL ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public String getDownloadUrl(Long attachmentId, Long requesterId) {
        TaskAttachment a = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", attachmentId));
        getTaskAndAssertMembership(a.getTaskId(), requesterId);
        return storageService.generatePresignedUrl(a.getStorageKey());
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Transactional
    public void delete(Long attachmentId, Long requesterId) {
        TaskAttachment a = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", attachmentId));

        Task task = taskRepository.findById(a.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", a.getTaskId()));
        Long projectId = task.getProject().getId();

        boolean isUploader = a.getUploadedById().equals(requesterId);
        boolean isAdmin     = memberRepository.findByProjectIdAndUserId(projectId, requesterId)
                .map(m -> m.getRole() == Role.ADMIN).orElse(false);

        if (!isUploader && !isAdmin) {
            throw new ForbiddenException("Only the uploader or project admin can delete this attachment");
        }

        storageService.delete(a.getStorageKey());
        attachmentRepository.deleteById(attachmentId);

        activityService.record(a.getTaskId(), projectId, requesterId,
                ActivityService.Action.ATTACHMENT_REMOVED, null, a.getFileName(), null);
        log.info("Attachment {} deleted by user {}", attachmentId, requesterId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Task getTaskAndAssertMembership(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!memberRepository.existsByProjectIdAndUserId(task.getProject().getId(), userId)) {
            throw new ForbiddenException("You are not a member of this project");
        }
        return task;
    }

    // ── DTO ───────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AttachmentDTO {
        private Long          id;
        private Long          taskId;
        private Long          uploadedById;
        private String        fileName;
        private String        contentType;
        private Long          sizeBytes;
        private String        downloadUrl;   // presigned S3 URL (null on upload response)
        private LocalDateTime createdAt;
    }

    private AttachmentDTO toDTO(TaskAttachment a, String downloadUrl) {
        return AttachmentDTO.builder()
                .id(a.getId())
                .taskId(a.getTaskId())
                .uploadedById(a.getUploadedById())
                .fileName(a.getFileName())
                .contentType(a.getContentType())
                .sizeBytes(a.getSizeBytes())
                .downloadUrl(downloadUrl)
                .createdAt(a.getCreatedAt())
                .build();
    }
}
