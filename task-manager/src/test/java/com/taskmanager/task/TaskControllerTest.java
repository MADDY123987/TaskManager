package com.taskmanager.task;

import com.taskmanager.BaseIntegrationTest;
import com.taskmanager.auth.entity.User;
import com.taskmanager.project.dto.ProjectDTOs.*;
import com.taskmanager.task.dto.TaskDTOs.*;
import com.taskmanager.task.entity.Task.Status;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Task API Tests")
class TaskControllerTest extends BaseIntegrationTest {

    private User admin;
    private User member;
    private Long projectId;

    @BeforeEach
    void setUp() throws Exception {
        admin  = createUser("Admin",  "admin@task.com");
        member = createUser("Member", "member@task.com");

        // Create project
        CreateProjectRequest projReq = new CreateProjectRequest();
        projReq.setName("Task Test Project");
        String projBody = mockMvc.perform(post("/api/projects")
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projReq)))
                .andReturn().getResponse().getContentAsString();
        projectId = objectMapper.readTree(projBody).path("data").path("id").asLong();

        // Add member to project
        AddMemberRequest addReq = new AddMemberRequest();
        addReq.setUserId(member.getId());
        mockMvc.perform(post("/api/projects/{id}/members", projectId)
                .header("Authorization", bearerToken(admin))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addReq)));
    }

    @Test
    @DisplayName("POST /api/projects/{id}/tasks - admin creates task")
    void createTask_byAdmin_success() throws Exception {
        CreateTaskRequest req = new CreateTaskRequest();
        req.setTitle("Fix login bug");
        req.setDescription("Session expires too quickly");
        req.setDueDate(LocalDate.now().plusDays(7));
        req.setAssignedTo(member.getId());

        mockMvc.perform(post("/api/projects/{id}/tasks", projectId)
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Fix login bug"))
                .andExpect(jsonPath("$.data.status").value("TODO"))
                .andExpect(jsonPath("$.data.assignedTo.id").value(member.getId()));
    }

    @Test
    @DisplayName("POST /api/projects/{id}/tasks - member cannot create task")
    void createTask_byMember_returns403() throws Exception {
        CreateTaskRequest req = new CreateTaskRequest();
        req.setTitle("Member task attempt");

        mockMvc.perform(post("/api/projects/{id}/tasks", projectId)
                        .header("Authorization", bearerToken(member))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/status - assignee can update own task status")
    void updateStatus_byAssignee_success() throws Exception {
        // Create task assigned to member
        CreateTaskRequest createReq = new CreateTaskRequest();
        createReq.setTitle("Assignee task");
        createReq.setAssignedTo(member.getId());
        String body = mockMvc.perform(post("/api/projects/{id}/tasks", projectId)
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andReturn().getResponse().getContentAsString();
        Long taskId = objectMapper.readTree(body).path("data").path("id").asLong();

        // Member updates status
        UpdateStatusRequest statusReq = new UpdateStatusRequest();
        statusReq.setStatus(Status.IN_PROGRESS);

        mockMvc.perform(patch("/api/tasks/{id}/status", taskId)
                        .header("Authorization", bearerToken(member))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} - admin can update all fields")
    void updateTask_byAdmin_fullEdit() throws Exception {
        CreateTaskRequest createReq = new CreateTaskRequest();
        createReq.setTitle("Original title");
        String body = mockMvc.perform(post("/api/projects/{id}/tasks", projectId)
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andReturn().getResponse().getContentAsString();
        Long taskId = objectMapper.readTree(body).path("data").path("id").asLong();

        UpdateTaskRequest updateReq = new UpdateTaskRequest();
        updateReq.setTitle("Updated title");
        updateReq.setStatus(Status.DONE);

        mockMvc.perform(put("/api/tasks/{id}", taskId)
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Updated title"))
                .andExpect(jsonPath("$.data.status").value("DONE"));
    }

    @Test
    @DisplayName("GET /api/projects/{id}/tasks - member sees only own tasks")
    void getTasks_memberSeesOnlyOwn() throws Exception {
        // Task assigned to member
        CreateTaskRequest t1 = new CreateTaskRequest();
        t1.setTitle("Member task");
        t1.setAssignedTo(member.getId());
        mockMvc.perform(post("/api/projects/{id}/tasks", projectId)
                .header("Authorization", bearerToken(admin))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(t1)));

        // Unassigned task
        CreateTaskRequest t2 = new CreateTaskRequest();
        t2.setTitle("Unassigned task");
        mockMvc.perform(post("/api/projects/{id}/tasks", projectId)
                .header("Authorization", bearerToken(admin))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(t2)));

        // Member should see only their task
        mockMvc.perform(get("/api/projects/{id}/tasks", projectId)
                        .header("Authorization", bearerToken(member)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title").value("Member task"));
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} - admin deletes task")
    void deleteTask_byAdmin_success() throws Exception {
        CreateTaskRequest createReq = new CreateTaskRequest();
        createReq.setTitle("To be deleted");
        String body = mockMvc.perform(post("/api/projects/{id}/tasks", projectId)
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andReturn().getResponse().getContentAsString();
        Long taskId = objectMapper.readTree(body).path("data").path("id").asLong();

        mockMvc.perform(delete("/api/tasks/{id}", taskId)
                        .header("Authorization", bearerToken(admin)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/tasks/{id}", taskId)
                        .header("Authorization", bearerToken(admin)))
                .andExpect(status().isNotFound());
    }
}
