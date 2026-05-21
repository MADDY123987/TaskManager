package com.taskmanager.project;

import com.taskmanager.BaseIntegrationTest;
import com.taskmanager.auth.entity.User;
import com.taskmanager.project.dto.ProjectDTOs.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Project API Tests")
class ProjectControllerTest extends BaseIntegrationTest {

    private User admin;
    private User member;

    @BeforeEach
    void setUp() {
        admin  = createUser("Admin User",  "admin@example.com");
        member = createUser("Member User", "member@example.com");
    }

    @Test
    @DisplayName("POST /api/projects - creates project and admin membership")
    void createProject_success() throws Exception {
        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Alpha Project");
        req.setDescription("Test project");

        mockMvc.perform(post("/api/projects")
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Alpha Project"))
                .andExpect(jsonPath("$.data.members", hasSize(1)))
                .andExpect(jsonPath("$.data.members[0].role").value("ADMIN"));
    }

    @Test
    @DisplayName("POST /api/projects - missing name returns 400")
    void createProject_missingName_returns400() throws Exception {
        CreateProjectRequest req = new CreateProjectRequest();

        mockMvc.perform(post("/api/projects")
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/projects - returns only projects user belongs to")
    void getProjects_onlyMine() throws Exception {
        // admin creates a project
        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("My Project");

        mockMvc.perform(post("/api/projects")
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // member should see 0 projects
        mockMvc.perform(get("/api/projects")
                        .header("Authorization", bearerToken(member)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        // admin should see 1 project
        mockMvc.perform(get("/api/projects")
                        .header("Authorization", bearerToken(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    @DisplayName("POST /api/projects/{id}/members - admin adds member")
    void addMember_byAdmin_success() throws Exception {
        // Create project as admin
        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Team Project");

        String body = mockMvc.perform(post("/api/projects")
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long projectId = objectMapper.readTree(body).path("data").path("id").asLong();

        // Add member
        AddMemberRequest addReq = new AddMemberRequest();
        addReq.setUserId(member.getId());

        mockMvc.perform(post("/api/projects/{id}/members", projectId)
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.role").value("MEMBER"));
    }

    @Test
    @DisplayName("POST /api/projects/{id}/members - non-admin gets 403")
    void addMember_byMember_returns403() throws Exception {
        // Admin creates project
        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Restricted Project");

        String body = mockMvc.perform(post("/api/projects")
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn().getResponse().getContentAsString();

        Long projectId = objectMapper.readTree(body).path("data").path("id").asLong();

        // Add admin as member first
        AddMemberRequest addAdmin = new AddMemberRequest();
        addAdmin.setUserId(member.getId());
        mockMvc.perform(post("/api/projects/{id}/members", projectId)
                .header("Authorization", bearerToken(admin))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addAdmin)));

        // Member tries to add another user - should be 403
        User anotherUser = createUser("Third", "third@example.com");
        AddMemberRequest addReq = new AddMemberRequest();
        addReq.setUserId(anotherUser.getId());

        mockMvc.perform(post("/api/projects/{id}/members", projectId)
                        .header("Authorization", bearerToken(member))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/projects/{id}/members/{userId} - admin removes member")
    void removeMember_byAdmin_success() throws Exception {
        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Shrinking Team");
        String body = mockMvc.perform(post("/api/projects")
                        .header("Authorization", bearerToken(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn().getResponse().getContentAsString();
        Long projectId = objectMapper.readTree(body).path("data").path("id").asLong();

        AddMemberRequest addReq = new AddMemberRequest();
        addReq.setUserId(member.getId());
        mockMvc.perform(post("/api/projects/{id}/members", projectId)
                .header("Authorization", bearerToken(admin))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addReq)));

        mockMvc.perform(delete("/api/projects/{id}/members/{uid}", projectId, member.getId())
                        .header("Authorization", bearerToken(admin)))
                .andExpect(status().isOk());
    }
}
