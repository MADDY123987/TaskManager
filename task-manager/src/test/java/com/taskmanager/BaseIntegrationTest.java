package com.taskmanager;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.auth.entity.User;
import com.taskmanager.auth.entity.UserRepository;
import com.taskmanager.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;
    @Autowired protected UserRepository userRepository;
    @Autowired protected JwtUtil jwtUtil;
    @Autowired protected PasswordEncoder passwordEncoder;

    @MockBean protected ConnectionFactory connectionFactory;
    @MockBean protected RedisConnectionFactory redisConnectionFactory;

    protected User createUser(String name, String email) {
        return userRepository.save(User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode("password123"))
                .build());
    }

    protected String bearerToken(User user) {
        return "Bearer " + jwtUtil.generateToken(user.getId(), user.getEmail());
    }
}
