import Redis from "ioredis";

let redisClient: Redis

export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
        });
        redisClient.on('error', (err) => {
            console.error('Redis error (rate limiting will fallback):', err);
        });
    }
    return redisClient;
}

export async function connectRedis(): Promise<void> {
    const client = getRedisClient();
    try {
        await client.connect();
        console.log('✅ Redis connected')
    } catch (error) {
        console.warn('⚠️  Redis not available — rate limiting using in-memory fallback', error);
    }
}

export async function disconnectRedis(): Promise<void> {
    if (redisClient) {
        try {
            await redisClient.quit();
            console.log('✅ Redis disconnected')
        } catch (error) {
            console.warn('⚠️  Error disconnecting Redis:', error);
        }
    }
}