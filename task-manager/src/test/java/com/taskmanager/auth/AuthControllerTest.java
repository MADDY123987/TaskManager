package com.taskmanager.auth;

import com.taskmanager.BaseIntegrationTest;
import com.taskmanager.auth.dto.AuthDTOs.*;
import com.taskmanager.auth.entity.OtpPurpose;
import com.taskmanager.auth.entity.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Auth API Tests")
class AuthControllerTest extends BaseIntegrationTest {

    @Autowired private OtpRepository otpRepository;

    @Test
    @DisplayName("POST /api/auth/register - success sends OTP")
    void register_success() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alice");
        req.setEmail("alice@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value(containsString("OTP sent")));
    }

    @Test
    @DisplayName("POST /api/auth/verify-otp - success creates user and returns JWT")
    void verifyOtp_success() throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setName("Alice");
        register.setEmail("alice@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk());

        String otp = otpRepository
                .findTopByEmailAndPurposeAndVerifiedFalseAndUsedFalseOrderByIdDesc(
                        "alice@example.com", OtpPurpose.REGISTRATION)
                .orElseThrow()
                .getOtp();

        VerifyRegistrationRequest verify = new VerifyRegistrationRequest();
        verify.setName("Alice");
        verify.setEmail("alice@example.com");
        verify.setOtp(otp);
        verify.setPassword("secret123");

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verify)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value("alice@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/register - duplicate email returns 400")
    void register_duplicateEmail_returns400() throws Exception {
        createUser("Alice", "alice@example.com");

        RegisterRequest req = new RegisterRequest();
        req.setName("Alice2");
        req.setEmail("alice@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/auth/register - missing name returns validation error")
    void register_missingName_returns400() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@example.com");

        mockMvc.perform(post("/api/auth/register")
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
    @DisplayName("GET /api/auth/me - unauthenticated returns 401")
    void getMe_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
