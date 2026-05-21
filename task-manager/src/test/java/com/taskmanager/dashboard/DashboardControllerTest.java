package com.taskmanager.dashboard;

import com.taskmanager.BaseIntegrationTest;
import com.taskmanager.auth.entity.User;
import com.taskmanager.project.dto.ProjectDTOs.*;
import com.taskmanager.task.dto.TaskDTOs.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Dashboard API Tests")
class DashboardControllerTest extends BaseIntegrationTest {

    private User admin;
    private Long projectId;

    @BeforeEach
    void setUp() throws Exception {
        admin = createUser("Dash Admin", "dash@example.com");

        CreateProjectRequest projReq = new CreateProjectRequest();
        projReq.setName("Dashboard Test Project");
        String body = mockMvc.perform(post("/api/projects")
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projReq)))
                .andReturn().getResponse().getContentAsString();
        projectId = objectMapper.readTree(body).path("data").path("id").asLong();
    }

    @Test
    @DisplayName("GET /api/dashboard - returns metrics for current user")
    void getDashboard_success() throws Exception {
        // Create 2 tasks
        for (int i = 1; i <= 2; i++) {
            CreateTaskRequest t = new CreateTaskRequest();
            t.setTitle("Task " + i);
            mockMvc.perform(post("/api/projects/{id}/tasks", projectId)
                    .header("Authorization", bearerToken(admin))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(t)));
        }

        mockMvc.perform(get("/api/dashboard")
                        .header("Authorization", bearerToken(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalTasks").value(2))
                .andExpect(jsonPath("$.data.tasksByStatus.TODO").value(2))
                .andExpect(jsonPath("$.data.tasksByStatus.IN_PROGRESS").value(0))
                .andExpect(jsonPath("$.data.tasksByStatus.DONE").value(0))
                .andExpect(jsonPath("$.data.overdueCount").value(0));
    }

    @Test
    @DisplayName("GET /api/dashboard - overdue tasks appear in response")
    void getDashboard_withOverdue() throws Exception {
        CreateTaskRequest t = new CreateTaskRequest();
        t.setTitle("Overdue task");
        t.setDueDate(LocalDate.now().minusDays(3)); // past due

        mockMvc.perform(post("/api/projects/{id}/tasks", projectId)
                .header("Authorization", bearerToken(admin))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(t)));

        mockMvc.perform(get("/api/dashboard")
                        .header("Authorization", bearerToken(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.overdueCount").value(1))
                .andExpect(jsonPath("$.data.overdueTasks", hasSize(1)))
                .andExpect(jsonPath("$.data.overdueTasks[0].title").value("Overdue task"));
    }

    @Test
    @DisplayName("GET /api/dashboard - unauthenticated returns 403")
    void getDashboard_unauthenticated_returns403() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isForbidden());
    }
}
