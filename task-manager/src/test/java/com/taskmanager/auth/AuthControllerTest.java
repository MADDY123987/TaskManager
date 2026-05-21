package com.taskmanager.auth;

import com.taskmanager.BaseIntegrationTest;
import com.taskmanager.auth.dto.AuthDTOs.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Auth API Tests")
class AuthControllerTest extends BaseIntegrationTest {

    @Test
    @DisplayName("POST /api/auth/signup - success")
    void signup_success() throws Exception {
        SignupRequest req = new SignupRequest();
        req.setName("Alice");
        req.setEmail("alice@example.com");
        req.setPassword("secret123");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value("alice@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/signup - duplicate email returns 400")
    void signup_duplicateEmail_returns400() throws Exception {
        createUser("Alice", "alice@example.com");

        SignupRequest req = new SignupRequest();
        req.setName("Alice2");
        req.setEmail("alice@example.com");
        req.setPassword("secret123");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/auth/signup - missing name returns validation error")
    void signup_missingName_returns400() throws Exception {
        SignupRequest req = new SignupRequest();
        req.setEmail("test@example.com");
        req.setPassword("secret123");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.name").exists());
    }

    @Test
    @DisplayName("POST /api/auth/login - success returns JWT")
    void login_success() throws Exception {
        createUser("Bob", "bob@example.com");

        LoginRequest req = new LoginRequest();
        req.setEmail("bob@example.com");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.type").value("Bearer"));
    }

    @Test
    @DisplayName("POST /api/auth/login - wrong password returns 401")
    void login_wrongPassword_returns401() throws Exception {
        createUser("Bob", "bob@example.com");

        LoginRequest req = new LoginRequest();
        req.setEmail("bob@example.com");
        req.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/auth/me - returns current user")
    void getMe_authenticated() throws Exception {
        var user = createUser("Carol", "carol@example.com");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", bearerToken(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("carol@example.com"))
                .andExpect(jsonPath("$.data.name").value("Carol"));
    }

    @Test
    @DisplayName("GET /api/auth/me - unauthenticated returns 403")
    void getMe_unauthenticated_returns403() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isForbidden());
    }
}
