package com.taskmanager.storage;



import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

/**
 * Wraps AWS S3 (or MinIO with the same SDK) for file storage.
 *
 * Required dependencies (pom.xml):
 *   <dependency>
 *     <groupId>software.amazon.awssdk</groupId>
 *     <artifactId>s3</artifactId>
 *   </dependency>
 *
 * application.yml:
 *   aws:
 *     s3:
 *       bucket: my-taskmanager-bucket
 *       region: us-east-1
 *       # For MinIO:
 *       endpoint: http://localhost:9000
 *       access-key: minioadmin
 *       secret-key: minioadmin
 */
@Service
@Slf4j
public class StorageService {

    private final S3Client    s3Client;
    private final S3Presigner presigner;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${app.storage.presigned-url-expiry-minutes:60}")
    private int presignedUrlExpiryMinutes;

    public StorageService(S3Client s3Client, S3Presigner presigner) {
        this.s3Client  = s3Client;
        this.presigner = presigner;
    }

    // ── Upload ────────────────────────────────────────────────────────────────

    /**
     * Uploads a file and returns the storage key.
     * Key format: attachments/{projectId}/{taskId}/{uuid}-{originalFilename}
     */
    public String upload(MultipartFile file, Long projectId, Long taskId) {
        String safeFilename = sanitize(file.getOriginalFilename());
        String key = String.format("attachments/%d/%d/%s-%s",
                projectId, taskId, UUID.randomUUID(), safeFilename);
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .contentLength(file.getSize())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("Uploaded file to S3: {}", key);
            return key;
        } catch (Exception ex) {
            log.error("S3 upload failed for key {}: {}", key, ex.getMessage());
            throw new RuntimeException("File upload failed: " + ex.getMessage(), ex);
        }
    }

    // ── Presigned download URL ────────────────────────────────────────────────

    public String generatePresignedUrl(String storageKey) {
        try {
            return presigner.presignGetObject(GetObjectPresignRequest.builder()
                            .signatureDuration(Duration.ofMinutes(presignedUrlExpiryMinutes))
                            .getObjectRequest(GetObjectRequest.builder()
                                    .bucket(bucket)
                                    .key(storageKey)
                                    .build())
                            .build())
                    .url()
                    .toString();
        } catch (Exception ex) {
            log.error("Failed to generate presigned URL for key {}: {}", storageKey, ex.getMessage());
            throw new RuntimeException("Could not generate download URL", ex);
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public void delete(String storageKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket).key(storageKey).build());
            log.info("Deleted S3 object: {}", storageKey);
        } catch (Exception ex) {
            log.error("S3 delete failed for key {}: {}", storageKey, ex.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String sanitize(String filename) {
        if (filename == null) return "file";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
