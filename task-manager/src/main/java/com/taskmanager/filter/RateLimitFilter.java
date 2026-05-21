package com.taskmanager.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.common.ApiResponse;
import com.taskmanager.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Value("${rate-limit.capacity:100}")
    private int capacity;

    @Value("${rate-limit.refill-duration:60}")
    private int refillDuration;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        // Skip rate limiting for public endpoints
        if (path.startsWith("/api/auth") || path.startsWith("/swagger-ui")
                || path.startsWith("/api-docs") || path.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = resolveRateLimitKey(request);

        try {
            Long currentCount = redisTemplate.opsForValue().increment("rate_limit:" + key);

            if (currentCount == 1) {
                redisTemplate.expire("rate_limit:" + key, Duration.ofSeconds(refillDuration));
            }

            if (currentCount > capacity) {
                log.warn("Rate limit exceeded for key: {}", key);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setHeader("Retry-After", String.valueOf(refillDuration));
                response.getWriter().write(objectMapper.writeValueAsString(
                        ApiResponse.error("Rate limit exceeded. Try again later.")));
                return;
            }
        } catch (Exception ex) {
            // If Redis is down, fail open (allow the request) — don't block users
            log.error("Rate limit Redis error, failing open: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String resolveRateLimitKey(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            try {
                String jwt = bearerToken.substring(7);
                if (jwtUtil.validateToken(jwt)) {
                    return "user:" + jwtUtil.getUserIdFromToken(jwt);
                }
            } catch (Exception ignored) {}
        }
        // Fall back to IP
        String ip = request.getHeader("X-Forwarded-For");
        if (!StringUtils.hasText(ip)) {
            ip = request.getRemoteAddr();
        }
        return "ip:" + ip;
    }
}
