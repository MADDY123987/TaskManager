package com.taskmanager.auth;

import com.taskmanager.BaseIntegrationTest;
import com.taskmanager.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JwtUtil Unit Tests")
class JwtUtilTest extends BaseIntegrationTest {

    @Test
    @DisplayName("generateToken and validateToken roundtrip")
    void generateAndValidate() {
        String token = jwtUtil.generateToken(42L, "user@example.com");
        assertThat(jwtUtil.validateToken(token)).isTrue();
        assertThat(jwtUtil.getUserIdFromToken(token)).isEqualTo(42L);
        assertThat(jwtUtil.getEmailFromToken(token)).isEqualTo("user@example.com");
    }

    @Test
    @DisplayName("validateToken returns false for tampered token")
    void tamperedToken_returnsFalse() {
        String token = jwtUtil.generateToken(1L, "a@b.com");
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertThat(jwtUtil.validateToken(tampered)).isFalse();
    }

    @Test
    @DisplayName("validateToken returns false for garbage input")
    void garbageToken_returnsFalse() {
        assertThat(jwtUtil.validateToken("not.a.jwt")).isFalse();
        assertThat(jwtUtil.validateToken("")).isFalse();
    }
}
