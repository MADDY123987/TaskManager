package com.taskmanager.ratelimiter;

public class RateLimiterService {

    private final RedisTokenBucketService redisTokenBucketService;

    public RateLimiterService(RedisTokenBucketService redisTokenBucketService) {
        this.redisTokenBucketService = redisTokenBucketService;
    }

    public boolean isAllowed(String clientId) {
        return redisTokenBucketService.isAllowed(clientId);
    }

    public long getCapacity(String clientId) {
        return redisTokenBucketService.getCapacity(clientId);
    }

    public long getAvailableTokens(String clientId) {
        return redisTokenBucketService.getAvailableTokens(clientId);
    }

}
