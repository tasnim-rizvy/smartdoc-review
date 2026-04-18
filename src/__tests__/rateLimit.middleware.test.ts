import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

// Mock Redis to always throw (force in-memory fallback)
jest.mock('../db/redis', () => ({
	getRedisClient: () => {
		throw new Error('Redis unavailable');
	},
}));

import { rateLimiter } from '../middlewares/rate-limit.middleware';

const makeReq = (userId = 'user-abc'): AuthRequest =>
	({ user: { id: userId, email: 'u@u.com', role: 'user' } }) as AuthRequest;

const mockRes = () => {
	const res = {} as Response;
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	res.setHeader = jest.fn();
	return res;
};

describe('rateLimiter (in-memory fallback)', () => {
	const next = jest.fn() as NextFunction;

	beforeEach(() => jest.clearAllMocks());

	it('calls next for requests under the limit', async () => {
		const req = makeReq('user-fresh');
		await rateLimiter(req, mockRes(), next);
		expect(next).toHaveBeenCalled();
	});

	it('calls next if no user is set', async () => {
		const req = { user: undefined } as AuthRequest;
		await rateLimiter(req, mockRes(), next);
		expect(next).toHaveBeenCalled();
	});

	it('returns 429 after exceeding limit', async () => {
		const userId = 'user-limited';
		// Exhaust the limit
		for (let i = 0; i < 10; i++) {
			await rateLimiter(makeReq(userId), mockRes(), next);
		}
		jest.clearAllMocks();
		const res = mockRes();
		await rateLimiter(makeReq(userId), res, next);
		expect(res.status).toHaveBeenCalledWith(429);
		expect(next).not.toHaveBeenCalled();
	});
});
