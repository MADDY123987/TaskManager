package com.taskmanager.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.common.ApiResponse;
import com.taskmanager.ratelimiter.RateLimiterService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/swagger-ui")
                || path.startsWith("/api-docs")
                || path.startsWith("/actuator")) {

            filterChain.doFilter(request, response);
            return;
        }

        String clientId =
                request.getHeader("X-Forwarded-For");

        if (clientId == null || clientId.isBlank()) {
            clientId = request.getRemoteAddr();
        }

        if (path.equals("/api/auth/login")) {

            boolean allowed =
                    rateLimiterService.isAllowed(clientId);

            if (!allowed) {

                response.setStatus(
                        HttpStatus.TOO_MANY_REQUESTS.value()
                );

                response.setContentType(
                        MediaType.APPLICATION_JSON_VALUE
                );

                response.getWriter().write(
                        objectMapper.writeValueAsString(
                                ApiResponse.error(
                                        "Too many login attempts"
                                )
                        )
                );

                return;
            }
        }


        filterChain.doFilter(request, response);
    }
}