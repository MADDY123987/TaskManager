package com.taskmanager.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * Configures AWS S3 or MinIO (same SDK, different endpoint).
 *
 * For AWS:    leave endpoint blank — SDK resolves automatically.
 * For MinIO:  set aws.s3.endpoint=http://localhost:9000
 *             and aws.s3.path-style-access-enabled=true
 *
 * pom.xml dependency:
 *   <dependencyManagement>
 *     <dependencies>
 *       <dependency>
 *         <groupId>software.amazon.awssdk</groupId>
 *         <artifactId>bom</artifactId>
 *         <version>2.25.0</version>
 *         <type>pom</type>
 *         <scope>import</scope>
 *       </dependency>
 *     </dependencies>
 *   </dependencyManagement>
 *   <dependency>
 *     <groupId>software.amazon.awssdk</groupId>
 *     <artifactId>s3</artifactId>
 *   </dependency>
 */
@Configuration
public class S3Config {

    @Value("${aws.s3.region:us-east-1}")
    private String region;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    @Value("${aws.s3.access-key:}")
    private String accessKey;

    @Value("${aws.s3.secret-key:}")
    private String secretKey;

    @Value("${aws.s3.path-style-access-enabled:false}")
    private boolean pathStyleAccess;

    private AwsCredentialsProvider credentialsProvider() {
        if (!accessKey.isBlank() && !secretKey.isBlank()) {
            return StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey));
        }
        // Falls back to environment variables / IAM role / ~/.aws/credentials
        return DefaultCredentialsProvider.create();
    }

    @Bean
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider());

        if (!endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }
        if (pathStyleAccess) {
            builder.forcePathStyle(true);
        }
        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        S3Presigner.Builder builder = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider());

        if (!endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }
        return builder.build();
    }
}
