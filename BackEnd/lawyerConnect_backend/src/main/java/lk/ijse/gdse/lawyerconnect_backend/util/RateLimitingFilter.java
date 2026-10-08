package lk.ijse.gdse.lawyerconnect_backend.util;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 120;
    private final Map<String, RequestCounter> requestCountsPerIp = new ConcurrentHashMap<>();

    private static class RequestCounter {
        final AtomicInteger count = new AtomicInteger(0);
        long startTime = System.currentTimeMillis();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String clientIp = getClientIP(request);
        long currentTime = System.currentTimeMillis();

        RequestCounter counter = requestCountsPerIp.compute(clientIp, (ip, currentCounter) -> {
            if (currentCounter == null || currentTime - currentCounter.startTime > 60000) {
                RequestCounter newCounter = new RequestCounter();
                newCounter.count.set(1);
                return newCounter;
            } else {
                currentCounter.count.incrementAndGet();
                return currentCounter;
            }
        });

        if (counter.count.get() > MAX_REQUESTS_PER_MINUTE) {
            log.warn("Rate limit exceeded for IP: {} on URL: {}", clientIp, request.getRequestURI());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"status\": 429, \"message\": \"Rate limit exceeded. Please try again in a minute.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
