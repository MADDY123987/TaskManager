package com.taskmanager.notification;



import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;

/**
 * Sends transactional emails via Spring Mail (SMTP / SES / SendGrid).
 *
 * Configure in application.yml:
 *   spring.mail.host, port, username, password
 *   app.mail.from = no-reply@taskmanager.com
 *   app.frontend.url = https://app.taskmanager.com
 *
 * Uses Thymeleaf HTML templates in resources/templates/email/.
 * Falls back to plain text if TemplateEngine is unavailable.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:no-reply@taskmanager.com}")
    private String fromAddress;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    // ── Task assigned ────────────────────────────────────────────────────────

    @Async
    public void sendTaskAssigned(String toEmail, String toName,
                                 String taskTitle, String projectName,
                                 String assignedByName, LocalDate dueDate, Long taskId) {
        Context ctx = new Context();
        ctx.setVariable("recipientName", toName);
        ctx.setVariable("taskTitle", taskTitle);
        ctx.setVariable("projectName", projectName);
        ctx.setVariable("assignedByName", assignedByName);
        ctx.setVariable("dueDate", dueDate);
        ctx.setVariable("taskUrl", frontendUrl + "/tasks/" + taskId);
        ctx.setVariable("appName", "Team Task Manager");

        send(toEmail,
                "Task assigned: " + taskTitle,
                renderOrFallback("email/task-assigned", ctx,
                        String.format("Hi %s,\n\nYou have been assigned task '%s' in project '%s' by %s.\nDue: %s\n\nView: %s/tasks/%d",
                                toName, taskTitle, projectName, assignedByName, dueDate, frontendUrl, taskId)));
    }

    // ── Task completed ───────────────────────────────────────────────────────

    @Async
    public void sendTaskCompleted(String toEmail, String toName,
                                  String taskTitle, String projectName,
                                  String completedByName, Long taskId) {
        Context ctx = new Context();
        ctx.setVariable("recipientName", toName);
        ctx.setVariable("taskTitle", taskTitle);
        ctx.setVariable("projectName", projectName);
        ctx.setVariable("completedByName", completedByName);
        ctx.setVariable("taskUrl", frontendUrl + "/tasks/" + taskId);

        send(toEmail,
                "Task completed: " + taskTitle,
                renderOrFallback("email/task-completed", ctx,
                        String.format("Hi %s,\n\nTask '%s' in project '%s' has been marked completed by %s.\n\nView: %s/tasks/%d",
                                toName, taskTitle, projectName, completedByName, frontendUrl, taskId)));
    }

    // ── Task overdue ─────────────────────────────────────────────────────────

    @Async
    public void sendTaskOverdue(String toEmail, String toName,
                                String taskTitle, String projectName,
                                LocalDate dueDate, Long taskId) {
        Context ctx = new Context();
        ctx.setVariable("recipientName", toName);
        ctx.setVariable("taskTitle", taskTitle);
        ctx.setVariable("projectName", projectName);
        ctx.setVariable("dueDate", dueDate);
        ctx.setVariable("taskUrl", frontendUrl + "/tasks/" + taskId);

        send(toEmail,
                "⚠ Overdue task: " + taskTitle,
                renderOrFallback("email/task-overdue", ctx,
                        String.format("Hi %s,\n\nTask '%s' in project '%s' was due on %s and is now overdue.\n\nView: %s/tasks/%d",
                                toName, taskTitle, projectName, dueDate, frontendUrl, taskId)));
    }

    // ── Member added ─────────────────────────────────────────────────────────

    @Async
    public void sendMemberAdded(String toEmail, String toName,
                                String projectName, String addedByName,
                                String role, Long projectId) {
        Context ctx = new Context();
        ctx.setVariable("recipientName", toName);
        ctx.setVariable("projectName", projectName);
        ctx.setVariable("addedByName", addedByName);
        ctx.setVariable("role", role);
        ctx.setVariable("projectUrl", frontendUrl + "/projects/" + projectId);

        send(toEmail,
                "You were added to project: " + projectName,
                renderOrFallback("email/member-added", ctx,
                        String.format("Hi %s,\n\n%s added you to project '%s' as %s.\n\nView: %s/projects/%d",
                                toName, addedByName, projectName, role, frontendUrl, projectId)));
    }

    // ── Comment added ────────────────────────────────────────────────────────

    @Async
    public void sendCommentAdded(String toEmail, String toName,
                                 String taskTitle, String commenterName,
                                 String commentPreview, Long taskId) {
        Context ctx = new Context();
        ctx.setVariable("recipientName", toName);
        ctx.setVariable("taskTitle", taskTitle);
        ctx.setVariable("commenterName", commenterName);
        ctx.setVariable("commentPreview", commentPreview.length() > 200
                ? commentPreview.substring(0, 200) + "..." : commentPreview);
        ctx.setVariable("taskUrl", frontendUrl + "/tasks/" + taskId);

        send(toEmail,
                commenterName + " commented on: " + taskTitle,
                renderOrFallback("email/comment-added", ctx,
                        String.format("Hi %s,\n\n%s left a comment on task '%s':\n\n\"%s\"\n\nView: %s/tasks/%d",
                                toName, commenterName, taskTitle, commentPreview, frontendUrl, taskId)));
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
            log.info("Email sent to {} — subject: {}", to, subject);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }

    private String renderOrFallback(String template, Context ctx, String plainFallback) {
        try {
            return templateEngine.process(template, ctx);
        } catch (Exception ex) {
            log.warn("Template '{}' failed to render, using plain-text fallback: {}", template, ex.getMessage());
            // Return as HTML-wrapped plain text to match expected format
            return "<pre style=\"font-family: Arial, sans-serif; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;\">" 
                   + plainFallback + "</pre>";
        }
    }

    // ── OTP emails ───────────────────────────────────────────────────────────

    @Async
    public void sendRegistrationOtp(String toEmail, String otp) {
        Context ctx = new Context();
        ctx.setVariable("otp", otp);
        ctx.setVariable("appName", "Team Task Manager");

        send(toEmail,
                "Verify your email - Task Manager",
                renderOrFallback("email/registration-otp", ctx,
                        String.format("""
                            Hi there!
                            
                            Your email verification code is: %s
                            
                            This code expires in 10 minutes.
                            Do not share this with anyone.
                            
                            - Task Manager Team
                            """, otp)));
    }

    @Async
    public void sendPasswordResetOtp(String toEmail, String otp) {
        Context ctx = new Context();
        ctx.setVariable("otp", otp);
        ctx.setVariable("appName", "Team Task Manager");

        send(toEmail,
                "Password Reset OTP - Task Manager",
                renderOrFallback("email/password-reset-otp", ctx,
                        String.format("""
                            Hi,
                            
                            Your password reset code is: %s
                            
                            This code expires in 10 minutes.
                            If you didn't request this, ignore this email.
                            
                            - Task Manager Team
                            """, otp)));
    }
}
