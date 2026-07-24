import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getRedisClient } from '../db/redis';

const memoryStore = new Map<string, { count: number; expiresAt: number }>();

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'); // 1 minute
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'); // 10 requests per window

export async function rateLimiter(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) {
	const userId = req.user?.id;
	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const key = `rate:${userId}`;
	const now = Date.now();
	const windowStart = now - WINDOW_MS;

	try {
		const redis = getRedisClient();
		const pipe = redis.pipeline();
		pipe.zremrangebyscore(key, 0, windowStart);
		pipe.zadd(key, now, `${now}-${Math.random()}`);
		pipe.zcard(key);
		pipe.pexpire(key, WINDOW_MS);
		const results = await pipe.exec();

		const count = (results?.[2]?.[1] as number) ?? 0;
		const remaining = Math.max(0, MAX_REQUESTS - count);
		const resetAt = Math.ceil((now + WINDOW_MS) / 1000);

		res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
		res.setHeader('X-RateLimit-Remaining', remaining);
		res.setHeader('X-RateLimit-Reset', resetAt);

		if (count > MAX_REQUESTS) {
			res.setHeader('Retry-After', Math.ceil(WINDOW_MS / 1000));
			res.status(429).json({
				message: 'Rate limit exceeded. Please slow down.',
				retryAfter: Math.ceil(WINDOW_MS / 1000),
			});
			return;
		}
	} catch {
		const entry = memoryStore.get(key);
		if (entry && entry.expiresAt > now) {
			entry.count++;
			if (entry.count > MAX_REQUESTS) {
				res
					.status(429)
					.json({ message: 'Rate limit exceeded.', retryAfter: 60 });
				return;
			}
		} else {
			memoryStore.set(key, { count: 1, expiresAt: now + WINDOW_MS });
		}
	}

	next();
}
