import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
        redisClient.on('error', (err) => {
            console.error('Redis error (rate limiting will fallback):', err);
        });
    }
    return redisClient;
}

export async function connectRedis(): Promise<void> {
    const client = getRedisClient();
    try {
        await client.ping();
        console.log('✅ Redis connected');
    } catch {
        console.warn('⚠️  Redis not available — rate limiting using in-memory fallback');
    }
}

export async function disconnectRedis(): Promise<void> {
    if (redisClient) {
        try {
            await redisClient.quit();
            redisClient = null;
            console.log('✅ Redis disconnected');
        } catch (error) {
            console.warn('⚠️  Error disconnecting Redis:', error);
        }
    }
}